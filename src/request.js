const timeout = {}

// ==================================  请求方法  ===============================

window.baseURL = 'http://localhost:8810'
// window.baseURL = 'http://192.168.2.7:8810'

// 请求防抖
function debounce(url, func) {
    let context = this,
        args = arguments;
    // clearTimeout(timeout[url]);
    // timeout[url] = setTimeout(function() {
    //     func.apply(context, args);
    // }, 500);

    func.apply(context, args);

}


export function getRequest(url) {
    return new Promise(resolve => {
        var myHeaders = new Headers();
        myHeaders.append("User-Agent", "Apifox/1.0.0 (https://apifox.com)");

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };

        debounce(url,()=>{
            fetch(url, requestOptions)
                .then(response => response.text())
                .then(result => resolve(JSON.parse(result)))
                .catch(error => console.log('error', error));
        })
    })
}


export function postRequest(url, body) {
    return new Promise(resolve => {
        var myHeaders = new Headers();
        myHeaders.append("User-Agent", "Apifox/1.0.0 (https://apifox.com)");
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify(body);

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        debounce(url, ()=>{
            fetch(url, requestOptions)
                .then(response => {
                    return response.text()
                })
                .then(response => {
                    try {
                        resolve(JSON.parse(response))
                    } catch (e) {
                        resolve(response)
                    }
                })
        })
    })
}
