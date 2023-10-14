

const magnitudes = {
    en: [
        'million', 
        'billion', 
        'trillion', 
        'quadrillion', 
        'quintillion',
        'sextillion', 
        'septillion', 
        'octillion',
        'nonillion',
        'ziiiiiilion'
    ],
    fr: [
        'million', 
        'milliard', 
        'billion', 
        'billiard', 
        'trillion', 
        'trilliard', 
        'quadrillion', 
        'quadrilliard',
        'quintillion',
        'ziiiiiilion'
        // 'quintilliard',
        // 'sextillion', 
        // 'sextilliard', 
        // 'septillion', 
        // 'septilliard',
        // 'octillion',
        // 'octilliard',
        // 'nonillion',
        // 'nonilliard',
    ],
};

const floatSeparator = {
    en: '.',
    fr: ',',
}

const thousandSeparator = {
    en: ',',
    fr: ' ',
}

// TODO for Ethereum: dust notation when significant digit < e-6
const dustTerm = {
    en: 'dust',
    fr: 'poussière',
}

function convertisseur(token, locale) {
    let { quantity, coin } = token
    
    quantity = quantity.replace(/^0+/, '');
    const biggerSignificantDigit = quantity.length - coin.decimals;
    let firstThreeDigits = quantity.slice(0, 3);
    let term;
    
    if (biggerSignificantDigit > 6) {
        const magnitude = Math.floor((biggerSignificantDigit - 1) / 3);
        const magnitudeTerm = magnitude - 2 < magnitudes[locale].length ? magnitudes[locale][magnitude - 2] : magnitudes[magnitudes[locale].length - 1];
        if (quantity.length % 3 > 0) {
            firstThreeDigits = firstThreeDigits.slice(0, biggerSignificantDigit % 3) 
                + floatSeparator[locale] + firstThreeDigits.slice(quantity.length % 3) 
        };
        term = firstThreeDigits + ' ' + magnitudeTerm + 
            (firstThreeDigits[0] == '1' ? '' : 's');
            console.log("supérieur à 6")
    }

    else 
    {
        
        let termNumber = quantity / Math.pow(10, 6);
        
        term = new Intl.NumberFormat(locale).format(termNumber) ;
        console.log ("inférieur à 6")
        
    }

   return console.log(term)
}



let token ={
    coin: {
        decimals: 6
    },
    quantity:" 1000000000000000000000"

}
convertisseur (token, "fr")

