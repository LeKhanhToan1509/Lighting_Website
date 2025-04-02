class RedisKeys {
    static ordersKey = {
        allOrders: () => `orders:all`,
        userOrders: (userId) => `orders:${userId}`,
    }

    static userKey = {
        allUsers: () => `users:all`,
        profile: (userId) => `users:${userId}`,
        pinVerify: (email) => `user:${email}:pin`,
        refreshToken: (userId) => `user:refresh_token:${userId}`
    }

    static transactionKey = {
        paymentTransaction: (paymentId) => `transaction:${paymentId}`,
    }
    
    static productKeys = {
        allProducts: () => `products:all`,
        productDetail: (productId) => `products:${productId}`
    };
}

export default RedisKeys;
