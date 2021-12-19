const productList = document.querySelector('.productWrap');
const productSelect = document.querySelector('.productSelect');
const cartList = document.querySelector('.shoppingCart-tableList');
const discardAllBtn = document.querySelector('.discardAllBtn');
const orderInfoBtn = document.querySelector('.orderInfo-btn');

let productData = [];
let cartData = [];

function init() {
    getProductList();
    getCartList();
}

init();

function getProductList() {
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`)
        .then(function (response) {
            productData = response.data.products;
            renderProductList();
        })
}

function combineProductHTMLItem(item) {
    return `<li class="productCard">
    <h4 class="productType">新品</h4>
    <img src="${item.images}"
        alt="">
    <a href="#" class="js-addCart" data-id=${item.id}>加入購物車</a>
    <h3>${item.title}</h3>
    <del class="originPrice">NT$${item.origin_price}</del>
    <p class="nowPrice">NT$${item.price}</p>
    </li>`
}

function renderProductList() {
    let str = "";
    productData.forEach(function (item) {
        str += combineProductHTMLItem(item);
    })
    productList.innerHTML = str;
}

productSelect.addEventListener('change', function (e) {
    const category = e.target.value;

    if (category == "全部") {
        renderProductList();
        return;
    }

    let str = "";
    productData.forEach(function (item) {
        if (item.category == category) {
            str += combineProductHTMLItem(item);
        }
    })
    productList.innerHTML = str;
})

productList.addEventListener('click', function (e) {
    e.preventDefault();
    let addCartClass = e.target.getAttribute('class');
    if (addCartClass !== "js-addCart") {
        return;
    }
    let productId = e.target.getAttribute('data-id');

    let numCheck = 1;
    cartData.forEach(function (item) {
        if (item.product.id === productId) {
            numCheck = item.quantity += 1
        }
    })

    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`, {
        "data": {
            "productId": productId,
            "quantity": numCheck
        }
    })
        .then(function (response) {
            alert("加入購物車");
            getCartList();
        })
})

function getCartList() {
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
        .then(function (response) {

            let totalPrice = document.querySelector('.js-total');
            totalPrice.textContent = response.data.finalTotal;

            cartData = response.data.carts;
            let str = "";
            cartData.forEach(function (item) {
                str += `<tr>
            <td>
                <div class="cardItem-title">
                    <img src="${item.product.images}" alt="">
                    <p>${item.product.title}</p>
                </div>
            </td>
            <td>NT$${item.product.price}</td>
            <td>${item.quantity}</td>
            <td>NT$${item.product.price * item.quantity}</td>
            <td class="discardBtn">
                <a href="#" class="material-icons" data-id="${item.id}">
                    clear
                </a>
            </td>
        </tr>`;
            })
            cartList.innerHTML = str;
        })
}

cartList.addEventListener('click', function (e) {
    e.preventDefault();
    const cartId = e.target.getAttribute('data-id');
    console.log(cartId);
    if (cartId == null) {
        return;
    }

    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`)
        .then(function (response) {
            alert("刪除單筆品項");
            getCartList();
        })
})

discardAllBtn.addEventListener('click', function (e) {
    e.preventDefault();

    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/`)
        .then(function (response) {
            alert("刪除所有品項");
            getCartList();
        })
        .catch(function (response) {
            alert("購物車內已無商品");
        })

})

orderInfoBtn.addEventListener("click", function (e) {
    e.preventDefault();
    if (cartData.length == 0) {
        alert("請加入購物車");
        return;
    }

    const customerName = document.querySelector('#customerName').value;
    const customerPhone = document.querySelector('#customerPhone').value;
    const customerEmail = document.querySelector('#customerEmail').value;
    const customerAddress = document.querySelector('#customerAddress').value;
    const customerTradeWay = document.querySelector('#tradeWay').value;

    if (customerName == "" || customerPhone == "" || customerEmail == "" || customerAddress == "" || customerTradeWay == "") {
        alert("請輸入訂單資料");
        return
    }

    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`, {
        "data": {
            "user": {
                "name": customerName,
                "tel": customerPhone,
                "email": customerEmail,
                "address": customerAddress,
                "payment": customerTradeWay
            }
        }
    }).then(function (response) {
        alert("訂單Success~");
        document.querySelector('#customerName').value = "";
        document.querySelector('#customerPhone').value= "";
        document.querySelector('#customerEmail').value= "";
        document.querySelector('#customerAddress').value= "";
        document.querySelector('#tradeWay').value= "ATM";
        
        getCartList();
    })


})