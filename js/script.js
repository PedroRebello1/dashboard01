document.addEventListener('DOMContentLoaded', () => {
    const chart = document.querySelector('#chart').getContext('2d');
    const labels = [
        '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
    ];

    const myChart = new Chart(chart, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'NVDC34',
                    data: Array(labels.length).fill(0),
                    borderColor: 'green',
                    borderWidth: 2
                },
                {
                    label: 'AAPL34',
                    data: Array(labels.length).fill(0),
                    borderColor: 'blue',
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    ticks: {
                        stepSize: 2
                    }
                }
            }
        }
    });

    // Load chart data from localStorage
    function loadChartData() {
        const savedData = localStorage.getItem('chartData');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            myChart.data.datasets[0].data = parsedData.nvidiaData;
            myChart.data.datasets[1].data = parsedData.appleData;
            myChart.update();
        }
    }

    // Save chart data to localStorage
    function saveChartData() {
        const chartData = {
            nvidiaData: myChart.data.datasets[0].data,
            appleData: myChart.data.datasets[1].data
        };
        localStorage.setItem('chartData', JSON.stringify(chartData));
    }

    const chartDebugging = false; // Variable to enable or disable chart debugging

    const url = 'qj4R3XWFkeTZKSzqHvkqBM';
    const apiUrl1 = `https://brapi.dev/api/quote/NVDC34?token=${url}`;
    const apiUrl2 = `https://brapi.dev/api/quote/AAPL34?token=${url}`;

    let nvidiaPriceNow = 0;
    let applePriceNow = 0;
    let lastFetchTime = 0;

    async function fetchData(apiUrl, elementId, multiplier) {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const regularMarketPrice = data.results[0].regularMarketPrice;
            const adjustedPrice = (regularMarketPrice * multiplier).toFixed(2);

            document.getElementById(elementId).textContent = `$${adjustedPrice}`;
            return parseFloat(adjustedPrice.replace('$', ''));
        } catch (error) {
            console.error(`Error fetching data from ${apiUrl}:`, error);
            document.getElementById(elementId).textContent = 'Error loading data.';
            return 0;
        }
    }

    async function fetchDataForChart(apiUrl) {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const regularMarketPrice = data.results[0].regularMarketPrice;

            if (apiUrl === apiUrl1) {
                nvidiaPriceNow = regularMarketPrice;
            } else if (apiUrl === apiUrl2) {
                applePriceNow = regularMarketPrice;
            }
        } catch (error) {
            console.error(`Error fetching data from ${apiUrl}:`, error);
        }
    }

    async function updateChartData() {
        const currentTime = new Date();

        let index = -1;

        if (chartDebugging) {
            // Use the time label '14:00' if debugging is enabled
            index = labels.indexOf('14:00');
        } else {
            const currentLabel = currentTime.getHours() + ':' + (currentTime.getMinutes() < 30 ? '00' : '30');
            index = labels.indexOf(currentLabel);
        }

        if (index !== -1) {
            // Fetch data if it's been more than 6 minutes since the last fetch
            const now = Date.now();
            if (now - lastFetchTime > 6 * 60 * 1000) {
                await fetchDataForChart(apiUrl1);
                await fetchDataForChart(apiUrl2);
                lastFetchTime = now;
            }

            myChart.data.datasets[0].data[index] = nvidiaPriceNow;
            myChart.data.datasets[1].data[index] = applePriceNow;
            myChart.update();
            saveChartData(); // Save chart data after updating
        }
    }

    setInterval(updateChartData, 180000); // Update chart data every 3 minutes

    function updateDateTime() {
        const now = new Date();
        const day = now.getDate();
        const month = now.toLocaleString('default', { month: 'short' });
        const year = now.getFullYear();
        const formattedDate = `${day} ${month}, ${year}`;
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'pm' : 'am';
        const formattedTime = `${hours % 12 || 12}:${minutes}:${seconds}${ampm}`;
        const dateTimeElements = document.querySelectorAll('.date-time');
        dateTimeElements.forEach(dateTimeElement => {
            dateTimeElement.querySelector('p').textContent = formattedDate;
            dateTimeElement.querySelector('small').textContent = formattedTime;
        });
    }

    updateDateTime();
    setInterval(updateDateTime, 1000); // Update date/time every second

    function updateAmountComparison() {
        const predefinedValues = {
            'Apple': 474.56,
            'Nvidia': 252.20
        };
        const investments = document.querySelectorAll('.investment');
        investments.forEach(investment => {
            const companyName = investment.querySelector('h4').textContent;
            const amountElement = investment.querySelector('.amount h4');
            const amountValue = parseFloat(amountElement.textContent.replace('$', '').replace(',', '.'));
            const predefinedValue = predefinedValues[companyName];
            if (predefinedValue) {
                const percentageChange = ((amountValue - predefinedValue) / predefinedValue) * 100;
                const smallElement = investment.querySelector('.amount small');
                smallElement.textContent = `${percentageChange.toFixed(2)}%`;
                if (percentageChange > 0) {
                    smallElement.classList.remove('danger');
                    smallElement.classList.add('success');
                } else {
                    smallElement.classList.remove('success');
                    smallElement.classList.add('danger');
                }
            }
        });
    }

    updateAmountComparison();
    setInterval(updateAmountComparison, 1000); // Update amount comparison every second

    function updateInvestimentos() {
        const expectedAppleValue = 474.56;
        const expectedNvidiaValue = 252.20;
        const taxas = 0.21;
        const expectedTotalValue = expectedAppleValue + expectedNvidiaValue + taxas;
        const appleAmountElement = document.querySelector('#appleAmount');
        const nvidiaAmountElement = document.querySelector('#nvidiaAmount');
        if (appleAmountElement && nvidiaAmountElement) {
            const appleAmount = parseFloat(appleAmountElement.textContent.replace('$', '').replace(',', '.'));
            const nvidiaAmount = parseFloat(nvidiaAmountElement.textContent.replace('$', '').replace(',', '.'));
            const actualTotalValue = appleAmount + nvidiaAmount;
            const percentageChange = ((actualTotalValue - expectedTotalValue) / expectedTotalValue) * 100;
            const investmentsTotalElement = document.querySelector('#investmentsTotal');
            const investmentsChangeElement = document.querySelector('#investmentsChange');
            const investmentsOriginalElement = document.querySelector('#investmentsOriginal');
            if (investmentsTotalElement && investmentsChangeElement && investmentsOriginalElement) {
                investmentsTotalElement.textContent = `$${actualTotalValue.toFixed(2)}`;
                investmentsChangeElement.textContent = `${percentageChange.toFixed(2)}%`;
                investmentsOriginalElement.textContent = `$${expectedTotalValue.toFixed(2)}`;
                if (percentageChange > 0) {
                    investmentsChangeElement.classList.remove('danger');
                    investmentsChangeElement.classList.add('success');
                } else {
                    investmentsChangeElement.classList.remove('success');
                    investmentsChangeElement.classList.add('danger');
                }
            }
        }
    }

    updateInvestimentos();
    setInterval(updateInvestimentos, 1000); // Update investimentos every second

    async function updateEarnings() {
        const nvidiaPrice = await fetchData(apiUrl1, 'nvidiaAmount', 20); // Fetch single share price
        const applePrice = await fetchData(apiUrl2, 'appleAmount', 8);   // Fetch single share price
        const expectedAppleValue = 474.56;
        const expectedNvidiaValue = 252.20;
        const totalExpected = expectedAppleValue + expectedNvidiaValue + 0.21;
        const totalActual = nvidiaPrice + applePrice;
        const earnings = (totalActual - totalExpected).toFixed(2);
        document.getElementById('earningsText').textContent = `$${earnings}`;
    }

    window.onload = function () {
        updateEarnings();
        setInterval(updateEarnings, 120000); // Update earnings every 2 minutes
        loadChartData(); // Load chart data when the page is loaded
    };
});
