

export default class paymentHelper {
    static createDescription(hexKey) {
        const time = new Date();
    
        const formattedTime = `${time.getFullYear()}${(time.getMonth() + 1).toString().padStart(2, '0')}${time.getDate().toString().padStart(2, '0')}`;
    
        return `${hexKey} ${formattedTime}`;
    }
     

    static geneKey = (cnt) => {
        const characters = 'abcdefghijklmnopqrstuvwxyz'; 
        let key = '';

        for (let i = 0; i < cnt; i++) {
            key += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        
        return key;
    }
    
}