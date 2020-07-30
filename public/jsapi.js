const ports = {};

// https://www.jsonrpc.org/specification
window.addEventListener("message", e => {
    console.log('received message on window', e);
    // Check origin
    if (!e.ports[0]) return;
    const referenceId = e.data.referenceId;
    console.log(`referenceId = ${referenceId}`);
    const port = e.ports[0];

    const onPortMessage = e => {
        console.log('received message on port', e);
        console.log(`referenceId = ${referenceId}`);
    
        if (e.data.params) {
            console.log('received rpc event message');
            const embedId = e.data.params['embedId'];
            const filters = e.data.params['filters'];
            console.log(`embedId = ${embedId}`);
            console.log(`filters = `, filters);
            const iframe = document.querySelector(`#iframe${referenceId}`);
            iframe.src = `/embed/page?column=${filters[0].column}&operand=${filters[0].operand}&values=${filters[0].values.join()}`
        }
    
        if (e.data.hasOwnProperty('result')) {
            console.log('received rpc response message');
            const result = e.data.result;
            console.log(`result = ${result}`);
        }
    
        if (e.data.error) {
            console.log('received rpc error message');
            console.log('error = ', e.data.error);
        }
    };

    port.onmessage = onPortMessage;
    ports[referenceId] = port;
});

const applyFilters = (filters = []) => {
    Object.values(ports).forEach(port => port.postMessage({
        id: 'setFilters123',
        jsonrpc: '2.0',
        method: '/v1/filters/apply',
        params: {
            filters
        }
    }));
}

const form_submit = function(event) {
    event.preventDefault();
    const column = document.querySelector("#column_input").value;
    const value = document.querySelector("#value_input").value;
    if (!column && !value) {
        applyFilters();
    } else {
        applyFilters([{"column": column, "operator": "IN", "values": [value]}]);
    }
}

const reset_form = function() {
    location.reload();
}
