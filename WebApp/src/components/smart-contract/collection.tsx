import LoaderSvg from '@/assets/iconSvg/loader.svg'
import { AccountIcon, NftIcon } from '@/components/common/ArtifactIcon'
import type { Contract } from '@/pages/api/contract-infos'
import { fetchCollectionTokens } from '@/utils/apiClient'
import { formatDateShort, formatToken } from '@/utils/format'
import { getAssetSources, getCollectionSources } from '@/utils/link'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'

type Props = {
  infos: Contract
  infos2: any
}

export function Collection(props: Props) {
  const [tokens, setTokens] = useState([])
  const [nftShow, setNftShow] = useState(
    tokens.find(token => Number(token.id.split('_')[1]) === Number(window.location.hash.match(/#(\d+)/)?.[1])) ??
      tokens.sort((a, b) => +a.id - +b.id)[0],
  )
  const { locale } = useRouter()

  let refAnim = useRef(null)
  let animIsRunning = false
  function changeNft(nft) {
    if (animIsRunning || nft === nftShow) return
    animIsRunning = true
    refAnim.current.classList.add('contract-collection2__nft__infos__animate')
    setTimeout(() => {
      setNftShow(nft)
    }, 240)
    setTimeout(() => {
      refAnim.current.classList.remove('contract-collection2__nft__infos__animate')
      animIsRunning = false
    }, 600)
  }

  const scrollNftRef = useRef(null)
  let currentFetch = false
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      const box = scrollNftRef.current
      const scrollPosition = box.scrollTop
      const boxHeight = box.clientHeight
      const totalContentHeight = box.scrollHeight

      if (scrollPosition / (totalContentHeight - boxHeight) > 0.8 && hasMore === true) {
        if (currentFetch === false) {
          currentFetch = true
          fetchCollectionTokens(
            props.infos.id,
            100,
            tokens[tokens.length - 1].id.split('_')[1],
            props.infos2.account.address,
          ).then(data => {
            if (data.length === 0) {
              setHasMore(false)
            } else {
              let newTokensTab = [...tokens, ...data]
              newTokensTab = newTokensTab.sort((a, b) => +a.id.split('_')[1] - +b.id.split('_')[1])
              newTokensTab = newTokensTab.filter(
                (token, index, self) => self.findIndex(t => t.id === token.id) === index,
              )
              setTokens(newTokensTab)
            }
            currentFetch = false
          })
        }
      } else if (scrollPosition / (totalContentHeight - boxHeight) < 0.2) {
        if (currentFetch === false) {
          currentFetch = true
          if (tokens[0].id.split('_')[1] == 0) {
            return
          }
          fetchCollectionTokens(
            props.infos.id,
            100,
            tokens[0].id.split('_')[1] - 100 < 0 ? 0 : tokens[0].id.split('_')[1] - 100,
            props.infos2.account.address,
          ).then(data => {
            let newTokensTab = [...data, ...tokens]
            newTokensTab = newTokensTab.sort((a, b) => +a.id.split('_')[1] - +b.id.split('_')[1])
            newTokensTab = newTokensTab.filter((token, index, self) => self.findIndex(t => t.id === token.id) === index)
            setTokens(newTokensTab)
            currentFetch = false
          })
        }
      }
    }

    const box = scrollNftRef.current
    box.addEventListener('scroll', handleScroll)
    return () => box.removeEventListener('scroll', handleScroll)
  }, [tokens, hasMore])

  useEffect(() => {
    currentFetch = true
    fetchCollectionTokens(
      props.infos.id,
      100,
      Number(window.location.hash.match(/#(\d+)/)?.[1]) > 50
        ? Number(window.location.hash.match(/#(\d+)/)?.[1]) - 50
        : 0,
      props.infos2.account.address,
    ).then(data => {
      if (data.length === 0) {
        setHasMore(false)
      } else {
        setNftShow(
          data.find(token => Number(token.id.split('_')[1]) === Number(window.location.hash.match(/#(\d+)/)?.[1])) ??
            data.sort((a, b) => +a.id - +b.id)[0],
        )
        let newTokensTab = [...tokens, ...data]
        newTokensTab = newTokensTab.sort((a, b) => +a.id.split('_')[1] - +b.id.split('_')[1])
        newTokensTab = newTokensTab.filter((token, index, self) => self.findIndex(t => t.id === token.id) === index)
        setTokens(newTokensTab)
        scrollNftRef.current.scrollTop = 3500
      }
      currentFetch = false
    })
  }, [])

  useEffect(() => {
    const handle = () => {
      if (tokens.find(token => Number(token.id.split('_')[1]) === Number(window.location.hash.match(/#(\d+)/)?.[1]))) {
        setNftShow(
          tokens.find(token => Number(token.id.split('_')[1]) === Number(window.location.hash.match(/#(\d+)/)?.[1])),
        )
      } else {
        fetchCollectionTokens(
          props.infos.id,
          100,
          Number(window.location.hash.match(/#(\d+)/)?.[1]) > 50
            ? Number(window.location.hash.match(/#(\d+)/)?.[1]) - 50
            : 0,
          props.infos2.account.address,
        ).then(data => {
          if (data.length === 0) {
            setHasMore(false)
          } else {
            setNftShow(
              data.find(
                token => Number(token.id.split('_')[1]) === Number(window.location.hash.match(/#(\d+)/)?.[1]),
              ) ?? data.sort((a, b) => +a.id - +b.id)[0],
            )
            let newTokensTab = [...tokens, ...data]
            newTokensTab = newTokensTab.sort((a, b) => +a.id.split('_')[1] - +b.id.split('_')[1])
            newTokensTab = newTokensTab.filter((token, index, self) => self.findIndex(t => t.id === token.id) === index)
            setTokens(newTokensTab)
          }
          currentFetch = false
        })
      }
    }

    window.addEventListener('hashchange', handle)

    return () => {
      window.removeEventListener('hashchange', handle)
    }
  }, [])

  return (
    <div
      className="contract-collection2 shadow-box"
      style={
        {
          '--dynamic-background-image': getCollectionSources(props.infos.image)
            ?.map(source => `url(${source})`)
            ?.join(','),
        } as any
      }
    >
      <div className="contract-collection2__infos">
        <div className="contract-collection2__infos__left">
          <AccountIcon
            account={{
              address: props.infos.id,
              name: props.infos.metadata?.name,
              accountType: 'collection',
              image: props.infos.image,
            }}
          />
          <div className="contract-collection2__infos__text">
            <h2 className="contract-collection2__infos__text__title">
              {props.infos.metadata?.name ?? props.infos2.account.name ?? 'Collection'}
            </h2>
            <p className="contract-collection2__infos__text__description">
              {props.infos.metadata?.description ? `Description : ${props.infos.metadata?.description}` : null}
            </p>
          </div>
        </div>
        <div className="contract-collection2__infos__right">
          <div className="contract-collection2__infos__right__div">
            <div>
              <p className="contract-collection2__infos__right__value">{props.infos.items}</p>
              <p>Unique NFT</p>
            </div>
          </div>
          {props.infos.volume_24h != 0 && (
            <div className="contract-collection2__infos__right__div">
              <div>
                <p className="contract-collection2__infos__right__value">
                  {formatToken(props.infos.volume_24h?.toString() ?? '', 6, locale)} XTZ
                </p>
                <p>Volume 24H</p>
              </div>
            </div>
          )}
          {props.infos.creationDate && (
            <div className="contract-collection2__infos__right__div">
              <div>
                <p className="contract-collection2__infos__right__value">
                  {formatDateShort(props.infos.creationDate, locale)}
                </p>
                <p>Creation date</p>
              </div>
            </div>
          )}
          <div className="contract-collection2__infos__right__div">
            <div>
              <p className="contract-collection2__infos__right__value">
                {formatToken(props.infos.floorPrice?.toString() ?? '--', 6, locale)} XTZ
              </p>
              <p>Floor price</p>
            </div>
          </div>
        </div>
      </div>
      <div className="contract-collection2__nft">
        <div className="contract-collection2__nft__list" ref={scrollNftRef}>
          {tokens.length &&
            tokens
              .sort((a, b) => +a.id.split('_')[1] - +b.id.split('_')[1])
              .map((nft, i) => {
                const sources = getAssetSources(nft.image, nft.id)

                return (
                  <div
                    key={nft.id}
                    className="contract-collection2__nft__list__nft"
                    style={nft.id === nftShow.id ? { backgroundColor: '#00000030' } : null}
                    onClick={() => changeNft(nft)}
                  >
                    <NftIcon nft={{ ...nft, name: nft.metadata?.name }} className="NftIcon" />
                    <div className="contract-collection2__nft__list__nft__text">
                      <h4>{nft.metadata?.name ?? 'NFT'}</h4>
                      <p>
                        {nft.owner.name ??
                          (nft.owner.address ? nft.owner.address?.slice(0, 8) + '...' : `${nft.holderscount} holders`)}
                      </p>
                    </div>
                  </div>
                )
              })}
          {hasMore && (
            <div className="contract-collection2__nft__list__loader">
              <Image height={50} width={50} src={LoaderSvg} alt="loader icon" />
            </div>
          )}
        </div>
        {nftShow ? (
          <div className="contract-collection2__nft__infos" ref={refAnim}>
            <div className="contract-collection2__nft__infos__text">
              <p className="contract-collection2__nft__infos__text__title">{nftShow.metadata?.name ?? 'Unnamed NFT'}</p>
              {nftShow.metadata?.description ? (
                <p className="contract-collection2__nft__infos__text__description">
                  <strong>Description :</strong> {nftShow.metadata?.description}
                </p>
              ) : null}
              <p className="contract-collection2__nft__infos__text__description">
                <strong>Copies :</strong> {nftShow.supply}
              </p>
              {nftShow.owner.address ? (
                <p className="contract-collection2__nft__infos__text__description">
                  <strong>Owner :</strong>{' '}
                  <Link href={'/' + nftShow.owner.address} title={nftShow.owner.address}>
                    {nftShow.owner.name ?? nftShow.owner.address?.slice(0, 8) + '...'}
                  </Link>
                </p>
              ) : (
                <p>{nftShow.holderscount} holders</p>
              )}
            </div>
            <NftIcon nft={{ ...nftShow, name: nftShow.metadata?.name }} className="NftIcon" />
          </div>
        ) : null}
      </div>
    </div>
  )
}
