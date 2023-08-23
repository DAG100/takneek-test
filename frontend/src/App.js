import {useState, useEffect} from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from "react-bootstrap/Button";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from "react-bootstrap/Form";

import "./App.css";

function App() {
	const [leaderboard, setLeaderboard] = useState("error");
	const [refresh, setRefresh] = useState(false); //toggle for refreshing
	const [formData, setFormData] = useState({
		password: "",
		eventname: "",
		eventcategory: "",
		poolpoints: {
			Peshwas: 0,
			Aryans: 0,
			Nawabs: 0,
			Shauryas: 0,
			Kshatriyas: 0
		}
	})
	const [response, setResponse] = useState("");
	useEffect(() => {
		(async () => {
			//structure of leaderboard at end:
// 			{
// 				categories: []
// 				pools: []
// 				leaderboard: {
// 						category_name: [
// 							{
// 								eventname, 
// 								pointspoints: {
// 								pool: points
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
				for (const event_category of categories) {
					temp_leaderboard[event_category] = [];
				}
				for (const pool of pools) {
					temp_total[pool] = 0;
				}
				for (const event of data) {
					temp_leaderboard[event.eventcategory].push({
						eventname: event.eventname, 
						poolpoints: event.poolpoints
					});
					for (const pool of pools) {
						temp_total[pool] += event.poolpoints[pool];
					}
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
		<Container>
			<Row>
				<Col>Event</Col>
				{leaderboard.pools.map(el => (
					<Col>{el}</Col>
				))}
			</Row>
			{leaderboard.categories.map(event_category => (
				<Row>
					<Col sm={1}>{event_category}</Col>
					<Col sm={11} style={{padding: 0}}>
						<Container style={{width: "100%"}}>
							{leaderboard.leaderboard[event_category].map(event => (
								<Row>
									<Col style={{flexBasis:"9%", flexGrow:"0"}}>{event.eventname}</Col>
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
				<Col>Total</Col>
				{Object.entries(leaderboard.total).map(el => <Col>{el[1]}</Col>)}
			</Row>
		</Container>
		<Button onClick={() => {setRefresh(!refresh);}}>Refresh</Button>
		<p>Add event:</p>
		<Container>
			<Row>
				<Col sm={1}><Form.Group>
					<Form.Label >Event Category</Form.Label>
					<Form.Select value={formData.eventcategory} onChange={(event) => {setFormData({...formData, eventcategory:event.target.value})}}>
						<option value="">---</option>
						{leaderboard.categories.map(el => (
							<option value={el}>{el}</option>
						))}
					</Form.Select>
				</Form.Group></Col>
				<Col sm={1}><Form.Group>
					<Form.Label>Event Name</Form.Label>
					<Form.Control type="text" placeholder="test" value={formData.eventname} onChange={(event) => {setFormData({...formData, eventname: event.target.value})}}/>
				</Form.Group></Col>
				{leaderboard.pools.map(el => (
				<Col><Form.Group>
					<Form.Label>{el} Points</Form.Label>
					<Form.Control type="number" placeholder="" value={formData.poolpoints[el]} onChange={(event) => {
					let newpoolpoints = formData.poolpoints;
					newpoolpoints[el] = event.target.value
					setFormData({
						...formData, 
						poolpoints: newpoolpoints
					})
					}} />
				</Form.Group></Col>
				))}
			</Row>
		</Container>
		<Form.Control type="password" placeholder="Admin Password" value={formData.password} onChange={(event) => {setFormData({...formData, password:event.target.value})}}/>
		<Button onClick={() => {
			console.log(formData);
			setResponse("Waiting...");
			(async () => {
				const temp = await (await fetch("/api/", {
					method: "POST",
					mode: "cors",
					headers: {"Content-Type":"application/json"},
					body: JSON.stringify(formData)
				})).json();
				setResponse(temp[0]);
				setRefresh(!refresh); //refresh leaderboard
			})();
		}}>Submit</Button>
		<p>{response}</p>
		</div>
	);
}

export default App;
