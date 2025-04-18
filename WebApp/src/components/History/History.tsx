import SuccessIcon from '@/assets/images/check.png'
import FailureIcon from '@/assets/images/failure.png'
import PendingIcon from '@/assets/images/pending.png'
import type { Account } from '@/backend/apiTypes'
import { AccountIcon, CoinIcon, NftIcon } from '@/components/common/ArtifactIcon'
import type { History } from '@/pages/api/account-history'
import { fetchAccountHistory } from '@/utils/apiClient'
import { eliminateDuplicates, groupBy, sum } from '@/utils/arrays'
import { useTranslation } from 'next-i18next'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import {
  addSign,
  formatDate,
  formatEntiereDate,
  formatInteger,
  formatToken,
  formatTokenWithExactAllDecimals,
} from '../../utils/format'

const LIMIT_HISTORY = 10
const LIMIT_OPERATIONS = 4
const LIMIT_TRANSFERS = 4
const LIMIT_METHODS = 3

type Props = {
  address: string
  operationCount: number | null
}

export default function History(props: Props) {
  const { t } = useTranslation('common')
  const { locale } = useRouter()
  const [history, setHistory] = useState<History>(null)
  const [counterparties, setCounterparties] = useState<Map<string, Account>>(null)
  const nextPageTokenRef = useRef(null)
  const historyRef = useRef(null)
  const loadingMoreRef = useRef(false)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    const { history$, nextPageToken$, counterpartiesInfo$ } = fetchAccountHistory(
      props.address,
      LIMIT_HISTORY,
      LIMIT_OPERATIONS,
    )

    history$.then(setHistory).catch(console.error)

    nextPageToken$.then(token => (nextPageTokenRef.current = token))

    counterpartiesInfo$
      .then(info =>
        setCounterparties(
          new Map(info.map(counterpartyInfo => [counterpartyInfo.account.address, counterpartyInfo.account])),
        ),
      )
      .catch(console.error)
  }, [props.address])

  useEffect(() => {
    if (!history) return

    function handleScroll() {
      const scrollHeight = document.documentElement.scrollHeight
      const scrollPosition = window.innerHeight + window.scrollY

      if (scrollHeight - scrollPosition < 400) {
        loadMore()
      }
    }

    document.addEventListener('scroll', handleScroll)

    return () => {
      if (historyRef.current) {
        document.removeEventListener('scroll', handleScroll)
      }
    }
  }, [history])

  function loadMore() {
    if (loadingMoreRef.current) return

    setLoadingMore((loadingMoreRef.current = true))

    const { history$, nextPageToken$, counterpartiesInfo$ } = fetchAccountHistory(
      props.address,
      LIMIT_HISTORY,
      LIMIT_OPERATIONS,
      nextPageTokenRef.current,
    )

    history$
      .then(moreHistory => {
        setHistory(history => history.concat(moreHistory))
        setLoadingMore((loadingMoreRef.current = false))
      })
      .catch(console.error)

    nextPageToken$.then(token => (nextPageTokenRef.current = token))

    counterpartiesInfo$
      .then(moreInfo =>
        setCounterparties(
          info =>
            new Map(
              Array.from(info).concat(
                moreInfo.map(counterpartyInfo => [counterpartyInfo.account.address, counterpartyInfo.account]),
              ),
            ),
        ),
      )
      .catch(console.error)
  }

  return history ? (
    <div className="operationsBox box shadow-box" ref={historyRef}>
      <div className="header">
        <h3>{t('History.Title')}</h3>
        {props.operationCount && (
          <span className="headerInfo">
            {formatInteger(props.operationCount, locale)} {t('History.OperationsFound')}
          </span>
        )}
      </div>

      {history?.map(batch => {
        const hash = batch[0].id
        const rootsByCounterparty = Array.from(groupBy(batch, root => root.counterpartyAddress))
        const operationLimit = rootsByCounterparty.length > LIMIT_OPERATIONS && LIMIT_OPERATIONS - 1

        return (
          <Link href={'/' + hash} key={hash} title={hash} className="batchLink">
            <div className="operationsBox__batch hoverItem">
              {rootsByCounterparty
                .slice(0, operationLimit || rootsByCounterparty.length)
                .map(([counterpartyAddress, operations], i) => {
                  const counterparty = counterparties?.get(counterpartyAddress)
                  // Merge balanceChanges
                  const balanceChanges = Array.from(
                    groupBy(
                      operations.flatMap(o => o.balanceChanges),
                      b => b.asset.id,
                    ),
                  ).map(([assetId, balanceChangeLists]) => ({
                    quantity: sum(balanceChangeLists.map(b => BigInt(b.quantity))),
                    asset: balanceChangeLists[0].asset,
                  }))
                  const transferLimit = balanceChanges.length > LIMIT_TRANSFERS && LIMIT_TRANSFERS - 1
                  const date = operations[0].date
                  const status = operations[0].status
                  const methods = eliminateDuplicates(
                    operations.map(o => o.functionName ?? o.tezosSpecificType).filter(o => o),
                  )
                  const methodLimit = methods.length > LIMIT_METHODS && LIMIT_METHODS - 1

                  return (
                    <div className="operationsBox__batch__operation" key={i}>
                      <div className="operationsBox__batch__operation__start">
                        <Link href={'/' + counterpartyAddress} title={counterpartyAddress}>
                          <AccountIcon account={counterparties?.get(counterpartyAddress)} />
                        </Link>
                        <div>
                          <Link href={'/' + counterpartyAddress}>
                            {counterparty ? (
                              <p className="operationsBox__batch__operation__start__name" title={counterpartyAddress}>
                                {counterparty?.name ??
                                  t('AccountDefaultName.' + (counterparty.accountType ?? 'userGroup'))}
                              </p>
                            ) : (
                              <div className="RoundedPlaceHolder" style={{ width: '100%', height: '25px' }} />
                            )}
                          </Link>
                          {i == 0 && (
                            <p
                              className="operationsBox__batch__operation__start__date"
                              title={t('History.Status.' + status) + formatEntiereDate(date, locale)}
                              style={{ color: { success: 'green', failure: 'red', waiting: '#808080' }[status] }}
                            >
                              <Image
                                className="statusIcon"
                                src={
                                  {
                                    success: SuccessIcon,
                                    failure: FailureIcon,
                                    waiting: PendingIcon,
                                  }[status]
                                }
                                alt={status}
                                width={20}
                              />
                              <span>{formatDate(date, locale)}</span>
                            </p>
                          )}
                          <div className="operationsBox__batch__operation__start__methods">
                            {methods.slice(0, methodLimit || methods.length).map(method => (
                              <pre key={method} className="operationsBox__batch__operation__start__method">
                                {method}
                              </pre>
                            ))}
                            {methodLimit && (
                              <pre className="operationsBox__batch__operation__start__method">
                                +{methods.length - methodLimit} {t('History.More.Operations')}
                              </pre>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="operationsBox__batch__operation__end">
                        {balanceChanges.slice(0, transferLimit || balanceChanges.length).map((transfer, i) =>
                          transfer.asset.assetType === 'coin' ? (
                            <p
                              key={i}
                              className="coin"
                              style={
                                transfer.quantity > 0
                                  ? { color: 'rgb(39 169 27)' }
                                  : transfer.quantity < 0
                                    ? { color: 'rgb(255 131 9)' }
                                    : null
                              }
                              title={
                                transfer.asset.name +
                                '\n' +
                                addSign(
                                  formatTokenWithExactAllDecimals(transfer.quantity, transfer.asset.decimals, locale) +
                                    ' ' +
                                    transfer.asset.ticker,
                                )
                              }
                            >
                              <CoinIcon coin={transfer.asset} />
                              <span>
                                {addSign(formatToken(transfer.quantity, transfer.asset.decimals, locale))}
                                {' ' + (transfer.asset.ticker ?? transfer.asset.name)}
                              </span>
                            </p>
                          ) : (
                            <p
                              key={i}
                              className="nft"
                              style={
                                transfer.quantity > 0
                                  ? { color: 'rgb(39 169 27)' }
                                  : transfer.quantity < 0
                                    ? { color: 'rgb(255 131 9)' }
                                    : null
                              }
                              title={
                                transfer.asset.name +
                                '\n' +
                                addSign(formatTokenWithExactAllDecimals(transfer.quantity, 0, locale) + ' NFT')
                              }
                            >
                              <NftIcon nft={transfer.asset} className="NftIcon" />
                              {addSign(formatInteger(transfer.quantity, locale))} NFT
                              {Math.abs(+transfer.quantity.toString()) == 1 ? '' : 's'}
                            </p>
                          ),
                        )}

                        {transferLimit && (
                          <div className="operationsBox__batch__operation__more">
                            +{balanceChanges.length - transferLimit} {t('History.More.Transfers')}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              {operationLimit && (
                <div className="operationsBox__batch__more">
                  +{rootsByCounterparty.length - operationLimit} {t('History.More.Operations')}
                </div>
              )}
            </div>
          </Link>
        )
      })}

      {loadingMore && <div className="RoundedPlaceHolder" style={{ minHeight: '20vh' }} />}
    </div>
  ) : (
    <div className="RoundedPlaceHolder" style={{ minHeight: '100vh' }} />
  )
}
