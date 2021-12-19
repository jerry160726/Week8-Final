const orderList = document.querySelector('.js-orderList');

let orderData = [];

function init() {
    getOrderList();
}

init();

function getOrderList() {
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
        {
            headers: {
                'authorization': token
            }
        }
    ).then(function (response) {
        orderData = response.data.orders;
        renderOrderList();
    })
}

function renderC3() {
    let total = {};
    orderData.forEach(function (item) {
        item.products.forEach(function (productItem) {
            if (total[productItem.category] == undefined) {
                total[productItem.category] = productItem.price * productItem.quantity;
            } else {
                total[productItem.category] += productItem.price * productItem.quantity;
            }
        })
    })
    

    let category = Object.keys(total);
    
    let newData = [];
    category.forEach(function (item) {
        let ary = [];
        ary.push(item);
        ary.push(total[item]);
        newData.push(ary);
    })
    


    let chart = c3.generate({
        bindto: '#chart', // HTML 元素綁定
        data: {
            type: "pie",
            columns: newData,
        },
    });
}

function renderOrderList() {
    let str = "";
    orderData.forEach(function (item) {
        //組時間字串
        const timeStamp = new Date(item.createdAt * 1000);
        const orderTime = `${timeStamp.getFullYear()}/${timeStamp.getMonth() + 1}/${timeStamp.getDate()}`;

        //組產品字串
        let productStr = "";
        item.products.forEach(function (productItem) {
            productStr += `<p>${productItem.title} x ${productItem.quantity}</p>`;
        });

        //判斷訂單狀態
        let orderStaus = "";
        if (item.paid == true) {
            orderStaus = "已處理";
        } else {
            orderStaus = "未處理";
        }

        str += `<tr>
        <td>${item.id}</td>
        <td>
            <p>${item.user.name}</p>
            <p>${item.user.tel}</p>
        </td>
        <td>${item.user.address}</td>
        <td>${item.user.email}</td>
        <td>
            ${productStr}
        </td>
        <td>${orderTime}</td>
        <td class="orderStatus">
            <a href="#" class="js-orderStatus" 
            data-status=${item.paid} data-id="${item.id}">${orderStaus}</a>
        </td>
        <td>
            <input type="button" 
            class="delSingleOrder-Btn js-orderDelete" 
            data-id="${item.id}" value="刪除">
        </td>
    </tr>`
    })
    orderList.innerHTML = str;
    renderC3();
}

orderList.addEventListener('click', function (e) {
    e.preventDefault();
    let orderTargetClass = e.target.getAttribute('class');
    let id = e.target.getAttribute("data-id")

    if (orderTargetClass == "delSingleOrder-Btn js-orderDelete") {
        deleteOrderItem(id);
        return
    }
    if (orderTargetClass == "js-orderStatus") {
        let status = e.target.getAttribute("data-status")
        changeOrderStatus(status, id);
        return
    }
})

function changeOrderStatus(status, id) {
    let newStatus;
    if (status == "true") {
        newStatus = false;
    } else if (status == "false") {
        newStatus = true;
    }

    axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
        {
            "data": {
                "id": id,
                "paid": newStatus
            }

        },
        {
            headers: {
                'authorization': token
            }
        }
    ).then(function (response) {
        alert("修改訂單狀態成功");
        getOrderList();
    })
}

function deleteOrderItem(id) {
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${id}`,
        {
            headers: {
                'authorization': token
            }
        }
    ).then(function (response) {
        alert("刪除該筆訂單成功");
        getOrderList();
    })
}

const discardAllBtn = document.querySelector('.discardAllBtn');
discardAllBtn.addEventListener("click", function (e) {
    e.preventDefault();
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
        {
            headers: {
                'authorization': token
            }
        }
    ).then(function (response) {
        alert("刪除全部訂單成功");
        getOrderList();
    })
})
