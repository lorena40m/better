import { OperationBatch } from '@/backend/apiTypes'
import { fetchOperation } from '@/utils/apiClient'
import { useTranslation } from 'next-i18next'
import { useEffect, useState } from 'react'
import Transaction from '../../components/operation/Transaction'
import Transfert from '../../components/operation/Transfert'
import { Page } from '../common/page'
import { OperationExecutions } from './OperationExecutions'

const Operation = ({ hash }) => {
  const { t } = useTranslation('common')
  const [operation, setOperation] = useState({} as OperationBatch)

  useEffect(() => {
    fetchOperation(hash).then(data => {
      setOperation(data)
    })
  }, [hash])

  return (
    <Page title="Operation on Tezos">
      <div className="pageComponent__center__content">
        <div className="left">
          <Transfert hash={hash} operation={operation} />
          <OperationExecutions operation={operation} />
        </div>
        <div className="right">
          <Transaction operation={operation} />
        </div>
      </div>
    </Page>
  )
}

export default Operation
