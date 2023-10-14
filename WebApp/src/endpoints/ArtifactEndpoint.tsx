async function  parsing_hash(hash: string) {
  if (typeof hash !== 'string') {
      throw new Error('Input must be a string');
  }
  if (hash.startsWith('tz')) {
      return "wallet"; 
  }
  else if (hash.startsWith('KT')){
      return "smartContract";
  }
  else if (hash.startsWith('op') || hash.startsWith('oo') || hash.startsWith('on')){
      return "operation"; 
  }
  else {
      throw new Error('This Hash is not a transaction, a wallet or a smart contract');
  }
}

export default (params: {
  id : string,
  pagesize : BigInt,
}) => {

  // TO DO : implement a function that tells if it's an operation or an address
  if (await parsing_hash(params.id) == "operation") {

    const sender = getTransactionSender(id);
    const receiver = getTransactionReceiver(id);
    const amount = getTransactionAmount(id);
    const fee = getTransactionFee(id);
    const date = getTransactionTimestamp(id);
    const status = getTransactionStatus(id);
    const contract = getTransactionContract(id);
    const  = getTransactionFunction(id);

    if(parsing_address(getTransactionReceiver(id)) == "wallet" && parsing_address(getTransactionSender(id))=="wallet") {
      return{
        id: id,
        type: "transfer",
        from: sender,
        to: receiver,
        amount: amount,
        fee: fee,
        date: date,
        status: status,
      }
    }
    else {
      return{
        id: id,
        type: "call",
        sender: sender,
        receiver: receiver,
        amount: amount,
        fee: fee,
        date: getTransactionTimestamp(id),
        status: getTransactionStatus(id),
        contract: getTransactionContract(id),
        function: getTransactionFunction(id),
      }
    }
  }
  else if (){
    parsing_address(id)
  }
  
  return {
  }
}
