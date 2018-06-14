// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
let selectedVal;
let myPort;
let parser = "";
const SerialPort = require("./node_modules/serialport");
const Readline = require('@serialport/parser-readline');
const _fs = require('fs');
SerialPort.list().then((ports) => {
    let allPort = "<option selected disabled>Please select a port</option>";
    ports.forEach((port) => {
        allPort += `<option value="${port.comName}">${port.comName}</option>`;
    });
    let selectBox = document.querySelector("select[name=comport]");
    selectBox.innerHTML = allPort;
    selectBox.addEventListener('change', function(){
        selectedVal = selectBox.options[selectBox.selectedIndex].value;
    });

});



function addData(chart, label, data) {
    chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(data);
    });
    chart.update();
}


const ctx = document.getElementById("firstChart").getContext('2d');
const myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'RPM per seconds',
            data: [],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',

            ],
            borderColor: [
                'rgba(255, 99, 132, 0.2)',
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true
                }
            }]
        }
    }
});
const ctx2 = document.getElementById("secondChart").getContext('2d');
const myChart2 = new Chart(ctx2, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'GR per seconds',
            data: [],
            backgroundColor: [

                'rgba(54, 162, 235, 1)',
            ],
            borderColor: [

                'rgba(54, 162, 235, 1)',
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true
                }
            }]
        }
    }
});
const ctx3 = document.getElementById("thirdChart").getContext('2d');
const myChart3 = new Chart(ctx3, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Current per seconds',
            data: [],
            backgroundColor: [
                'rgba(255, 193, 7, 0.5)',
            ],
            borderColor: [
                'rgba(255, 193, 7, 0.5)',
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true
                }
            }]
        }
    }
});
const ctx4 = document.getElementById("fourthChart").getContext('2d');
const myChart4 = new Chart(ctx4, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Voltage per seconds',
            data: [],
            backgroundColor: [
                'rgba(75, 192, 192, 0.2)',
            ],
            borderColor: [
                'rgba(75, 192, 192, 0.2)',
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true
                }
            }]
        }
    }
});
const ctx5 = document.getElementById("fifthChart").getContext('2d');
const myChart5 = new Chart(ctx5, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Watt per seconds',
            data: [],
            backgroundColor: [
                'rgba(153, 102, 255, 0.2)',
            ],
            borderColor: [
                'rgba(153, 102, 255, 0.2)',
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true
                }
            }]
        }
    }
});
document.getElementById('ksIncreaser').addEventListener('click',function (event) {
   myPort.write('5');
});
let button = document.getElementById('startBtn');
let AllData = [];
button.addEventListener('click',(event)=> {
    console.log(selectedVal);
    if(typeof(selectedVal) === String){
        myPort = new SerialPort(selectedVal,{
            baudRate:9600
        });
        parser = myPort.pipe(new Readline({ delimiter: '\r\n' }));
        let stopState = event.currentTarget.getAttribute('data-started');
        if(stopState === 'false'){
            AllData = [];
            event.currentTarget.setAttribute('data-started','true');
            event.currentTarget.innerText = "Stop Test";
            setInterval(function (){
                myPort.write('2');
            },500);
            parser.on('data', (res) =>{
                let response = JSON.parse(res);
                document.getElementById('rpm').innerText = response.xrpm;
                document.getElementById('amper').innerText = response.a11;
                document.getElementById('volt').innerText = response.v11;
                document.getElementById('watt').innerText = response.watt;
                let mechanic = ((response.xunits1 * 2 * Math.PI * response.xrpm )/60);
                document.getElementById('mechanic').innerText = mechanic;
                document.getElementById('efficency').innerText = mechanic / response.watt;
                AllData.push(response);
                addData(myChart, "", response.xrpm);
                addData(myChart2, "" , response.xunits);
                addData(myChart3, "", response.a11);
                addData(myChart4, "", response.v11);
                addData(myChart5, "", response.watt);
            });
        }else{
            myPort.close();
            event.currentTarget.innerText = "Start Test";
            event.currentTarget.setAttribute('data-started', 'false');
            let fileName = Date.now() + "CBI.txt";
            let fileData = "";
            for(let i = 0; i < AllData.length ; i++ ){
                fileData = fileData + AllData[i].xrpm + "," + AllData[i].xunits + "," + AllData[i].xunits + "," +AllData[i].xunits1 + "," +
                    AllData[i].a11 + "," + AllData[i].v11 + "," +AllData[i].watt + "+";
            }
            console.log(fileData);
            _fs.writeFile(`./resources/app/files/${fileName}`, fileData,(err)=>{
                if(err) console.log(err);
            });
        }
    }else{
        alert('Please Select the Port');
    }

});
document.getElementById('clearGraph',function () {
    myChart.data.datasets.data  = [];
    myChart.update();
    myChart2.data.datasets.data = [];
    myChart2.update();
    myChart3.data.datasets.data = [];
    myChart3.update();
    myChart4.data.datasets.data = [];
    myChart4.update();
    myChart5.data.datasets.data = [];
    myChart5.update();
});