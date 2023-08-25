import {useState, useEffect} from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from "react-bootstrap/Button";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import "./App.css";

function App() {
	const [leaderboard, setLeaderboard] = useState("error");
	const [refresh, setRefresh] = useState(false); //toggle for refreshing
	useEffect(() => {
		(async () => {
			//structure of leaderboard at end:
// 			{
// 				categories: []
// 				pools: []
// 				leaderboard: {
// 						category_name: [
// 							{
//								_id,
// 								eventname, 
// 								pointspoints: {
// 									pool: points
//								},
//								link
// 							}
// 						}
// 					]
// 				}
//				total: {pool: points}
// 			}
			try {
				const categories = await(await fetch("/api/categories/")).json();
				const pools = await (await fetch("/api/pools/")).json();
				const data = await (await fetch("/api/")).json();
				let temp_leaderboard = {};
				let temp_total = {};
				let temp_category_totals = {};
				for (const event_category of categories) {
					temp_leaderboard[event_category] = [];
					temp_category_totals[event_category] = {};
				}
				for (const pool of pools) {
					temp_total[pool] = 0;
					for (const event_category of categories) {
						temp_category_totals[event_category][pool] = 0;
					}
				}
				for (const event of data) {
					temp_leaderboard[event.eventcategory].push({
						_id: event._id,
						eventname: event.eventname, 
						poolpoints: event.poolpoints,
						link: event.link === undefined ? "" : event.link
					});
					for (const pool of pools) {
						temp_total[pool] += event.poolpoints[pool];
						temp_category_totals[event.eventcategory][pool] += event.poolpoints[pool];
					}
				}
				for (const event_category of categories) {
					temp_leaderboard[event_category].push({
						_id: "",
						eventname: "Total",
						poolpoints: temp_category_totals[event_category],
						link: ""
					})
				}
				setLeaderboard({
					categories: categories,
					pools: pools,
					leaderboard: temp_leaderboard,
					total: temp_total
				});
				console.log({
					categories: categories,
					pools: await (await fetch("/api/pools/")).json(),
					leaderboard: temp_leaderboard,
					total: temp_total
				});
			} catch (e) {
				setLeaderboard("error");
				console.error(e);
			}
		})();
	}, [refresh]);
	
	if (leaderboard === "error") return (
		<div className="error">Someting went wrong. Check the console for details.</div>
	);
	else return (
		<div className="main">
		<h2>SnT Council</h2>
		<h1>Takneek</h1> 
		<Container>
			<Row className="table-head">
				<Col sm={12} md={3}>Problem Statement</Col>
				<Col sm={12} md={9}>
				<Row style={{padding:0}}>
				{leaderboard.pools.map((el, index) => (
					<Col style={{padding: 0}} xs={{offset: (index === 0 ? 2 : 0)}} sm={{offset: (index === 0 ? 2 : 0)}} md={{offset: 0}}>{el}</Col>
				))}
				</Row>
				</Col>
			</Row>
			{leaderboard.categories.map(event_category => (
				<Row>
					<Col sm={12} md={1}>{event_category}</Col>
					<Col sm={12} md={11} style={{padding: 0}}>
						<Container style={{width: "100%"}}>
							{leaderboard.leaderboard[event_category].map(event => (
								<Row>
									<Col className="row-head">
									{event.link === "" 
									? event.eventname 
									: (<a href={event.link} target="_blank" rel="noreferrer">{event.eventname}</a>)}
									</Col>
									{Object.entries(event.poolpoints).map(el => (
											<Col>{el[1]}</Col>
										))}
								</Row>
					))}
						</Container>
					</Col>
				</Row>
			))}
			<Row>
				<Col sm={12} md={3}>Total</Col>
				<Col sm={12} md={9} style={{padding:0}}>
				<Row style={{padding:0}}>
				{Object.entries(leaderboard.total).map((el, index) => <Col xs={{offset: (index === 0 ? 2 : 0)}} sm={{offset: (index === 0 ? 2 : 0)}} md={{offset: 0}}>{el[1]}</Col>)}
				</Row></Col>
			</Row>
		</Container>
		
		
		
		<Button onClick={() => {setRefresh(!refresh);}}>Refresh</Button>
		
		
		</div>
	);
}

export default App;
