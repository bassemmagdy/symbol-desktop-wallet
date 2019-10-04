import {Transaction, TransferTransaction, Address, TransactionType, InnerTransaction} from "nem2-sdk"
import {transactionTag} from "@/config"
import {getRelativeMosaicAmount} from '@/core/utils'
import {transferIcons, transactionTypeToIcon} from '@/common/img/monitor/icons'
import {ChainStatus} from './ChainStatus'
import {AppState} from './types'
import {Store} from 'vuex'

/**
 * Custom properties built from transaction headers
 */
export class TransactionHeader {
   /**
   * Active account is the recipient
   */
  isReceipt: boolean
  /**
   * Transaction tag
   */ 
  tag: string
  /**
   * Transaction blockTime
   */
  time: string // @TODO: make extrapolation method from blockNumber
  /**
   * Transaction date
   */
  date: Date
  /**
   * Absolute fee
   */
  fee: number
  /**
   * BlockNumber
   */
  block: number
  /**
   * Transaction Hash
   */
  hash: string

  /** 
   * icon
   */ 
  icon:any

  constructor(transaction: Transaction, store: Store<AppState>) {
      const {wallet, networkCurrency} = store.state.account

     this.isReceipt = transaction instanceof TransferTransaction
        && transaction.recipient instanceof Address // @TODO: handle namespaceId
        && transaction.recipient.plain()  === wallet.address

      const chainStatus: ChainStatus = store.state.app.chainStatus

     this.tag = this.getTag(transaction)
     this.fee = getRelativeMosaicAmount(transaction.maxFee.compact(), networkCurrency.divisibility)
     this.icon = this.getIcon(transaction)

     if (transaction.transactionInfo) {
          this.block = transaction.transactionInfo.height.compact()
          this.time = chainStatus.getTimeFromBlockNumber(this.block)
          this.date = new Date(this.time)
          this.hash = transaction.transactionInfo.hash
     }
  }

  getTag(tx: Transaction) {
      if(tx.type === TransactionType.TRANSFER && this.isReceipt) return transactionTag.RECEIPT
      if(tx.type === TransactionType.TRANSFER && !this.isReceipt) return transactionTag.PAYMENT
      return transactionTag[tx.type]
  }

  getIcon(tx: Transaction) {
     if (tx.type === TransactionType.TRANSFER) {
         return this.isReceipt ? transferIcons.transferReceived : transferIcons.transferSent
     }

     return transactionTypeToIcon[tx.type]
  }
}