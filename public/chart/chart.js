   
   
  

    function chartData (){

        axios.get('/admin/chart-datas').then((res)=>{

            console.log(res.data)

			let week = [];
			let month = [];
			let payment = [];
			let category = [];

		   week = res.data.week;
           month = res.data.month;
           payment = res.data.payment;
           category = res.data.category;

            console.log(week ,'week report')
            console.log(month ,'month report')
            console.log(payment ,'payment report')

            document.getElementById('codcount').innerHTML = `COD &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;=&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${payment[0].Cod}</span>`
            document.getElementById('onlinepaymentcount').innerHTML = `Online &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;=&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${payment[0].Online}</span>`
			document.getElementById('men').innerHTML = `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;=&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${category[0]._id.count}`
			document.getElementById('kids').innerHTML = `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;=&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${category[1]._id.count}`
			document.getElementById('women').innerHTML = `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;=&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${category[2]._id.count}`
			var options1 = {
				chart: {
					type: 'line'
				},
				series: [{
					name: 'sales',
					data: [week[0].total,week[1].total,week[2].total,week[3].total,week[4].total,week[5].total,week[6].total,]
				}],
				xaxis: {
					categories: ['Day-1','Day-2','Day-3','Day-4','Day-5','Day-6','Day-7',]
				}
				}
			   var chart = new ApexCharts(document.querySelector("#chart"), options1);
				chart.render();
		
		
		
		
			var options2 = {
				chart: {
					type: 'donut'
				},
				series: [payment[0].Cod,payment[0].Online],
				labels: ['COD', 'Online',],
				responsive: [{
					breakpoint: 480,
					options: {
					chart: {
						width: 100
					},
					legend: {
						position: 'bottom'
					}
					}
				}]
				}
			   var chart1 = new ApexCharts(document.querySelector("#chart1"), options2);
				chart1.render();
				
		
				var options3 = {
					chart: {
						type: 'bar'
					},
					series: [{
						name: 'Sales',
						data: [category[0]._id.count,category[1]._id.count,category[2]._id.count,]
					}],
					xaxis: {
						categories: ['Men','Kids','Women']
					}
					}
					var chart2 = new ApexCharts(document.querySelector("#chart2"), options3);
					chart2.render();
		
				
				
				
				var options4 = {
					chart: {
						type: 'line'
					},
					series: [{
						name: 'Sales',
						data: [month[0].total,month[1].total,month[2].total,month[3].total,]
					}],
					xaxis: {
						categories: [month[0]._id,month[1]._id,month[2]._id,month[3]._id,]
					}
					}
					var chart3 = new ApexCharts(document.querySelector("#chart3"), options4);
					chart3.render();

			// if(weekReport){
			// 	// for (let i = 0; i < weekReport.length; i++) {
			// 	// 	week.push(weekReport[i]);
			// 	// }
				
			// 	week = weekReport;

			// }
			// if(monthReport){
				
			// 	month = monthReport
				
			// }
			// if(paymentReport){
				
			// 	payment = paymentReport;
				
			// }
			// if(categoryReport){
				
			// 		const cat = categoryReport.reduce((acc,curr)=>{
			// 			const data = {
			// 				category:curr._id.category[0].name,
			// 				count:curr._id.count
			// 			}
			// 			acc.push(data)
			// 		},[])
			// 	category = cat;
			// 	console.log(cat,'category..........from the chart js')
			// 	console.log(category,'category..........from the chart js')
			// }
        })

    }








       
 