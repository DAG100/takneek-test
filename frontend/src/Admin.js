import {useState, useEffect} from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from "react-bootstrap/Button";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from "react-bootstrap/Form";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";

import "./App.css";

function App() {
	const empty = {
		eventname: "",
		eventcategory: "",
		poolpoints: {
			Aryans: 0,
			Kshatriyas: 0,
			Nawabs: 0,
			Peshwas: 0,
			Shauryas: 0
		},
		link: ""
	}
	const [leaderboard, setLeaderboard] = useState("error");
	const [refresh, setRefresh] = useState(false); //toggle for refreshing
	const [password, setPassword] = useState("");
	const [formData, setFormData] = useState(empty);
	const [response, setResponse] = useState("");
	const [editSelected, setEditSelected] = useState({
		_id: "",
		...empty
	}); //object for edit
	const [delSelected, setDelSelected] = useState({
		_id: "",
		...empty
	})
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
								<Row 
									onClick={() => {
										setEditSelected((event._id === "" ? {
											_id: "",
											...empty
										} : {...event, eventcategory:event_category}));
										setDelSelected((event._id === "" ? {
											_id: "",
											...empty
										} : {...event, eventcategory:event_category}));
										console.log((event._id === "" ? {} : event))}}>
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
		
		
		<Form.Control type="password" placeholder="Admin Password" value={password} onChange={(event) => {setPassword(event.target.value)}}/>
		<p>{response}</p>
		
		<Tabs defaultActiveKey="add">
		<Tab eventKey="add" title="Add Event">
		<p>Add event:</p>
		<Container>
			<Row>
				<Col sm={1}><Form.Group>
					<Form.Label >P.S. Category</Form.Label>
					<Form.Select value={formData.eventcategory} onChange={(event) => {setFormData({...formData, eventcategory:event.target.value})}}>
						<option value=""></option>
						{leaderboard.categories.map(el => (
							<option value={el}>{el}</option>
						))}
					</Form.Select>
				</Form.Group></Col>
				
				<Col sm={1}><Form.Group>
					<Form.Label>P.S. Name</Form.Label>
					<Form.Control type="text" placeholder="" value={formData.eventname} onChange={(event) => {setFormData({...formData, eventname: event.target.value})}}/>
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
				</Form.Group></Col>))}
				
			</Row>
			<Row><Col><Form.Group>
				<Form.Label>URL to problem statement PDF</Form.Label>
				<Form.Control type="text" placeholder="URL" value={formData.link} onChange={(event) => {setFormData({...formData, link:event.target.value})}} />
			</Form.Group></Col></Row>
		</Container>
		<Button onClick={() => {
			console.log(formData);
			setResponse("Waiting...");
			(async () => {
				const temp = await (await fetch("/api/add", {
					method: "POST",
					mode: "cors",
					headers: {"Content-Type":"application/json"},
					body: JSON.stringify({...formData, password: password})
				})).json();
				setResponse(temp[0]);
				setRefresh(!refresh); //refresh leaderboard
			})();
		}}>Submit</Button>
		</Tab>
		<Tab eventKey="edit" title="Edit Events">
		<p>Edit event:</p>
		<p>Click on an event in the table above to select it here for editing.</p>
		<Container>
			<Row>
			
				<Col sm={1}><Form.Group>
					<Form.Label >P.S. Category</Form.Label>
					<Form.Select value={editSelected.eventcategory} onChange={(event) => {setEditSelected({...editSelected, eventcategory:event.target.value})}}>
						<option value=""></option>
						{leaderboard.categories.map(el => (
							<option value={el}>{el}</option>
						))}
					</Form.Select>
				</Form.Group></Col>
				
				<Col sm={1}><Form.Group>
					<Form.Label>P.S. Name</Form.Label>
					<Form.Control type="text" placeholder="" value={editSelected.eventname} onChange={(event) => {setEditSelected({...editSelected, eventname: event.target.value})}}/>
				</Form.Group></Col>
				
				{leaderboard.pools.map(el => (
				<Col><Form.Group>
					<Form.Label>{el} Points</Form.Label>
					<Form.Control type="number" placeholder="" value={editSelected.poolpoints[el]} onChange={(event) => {
					let newpoolpoints = editSelected.poolpoints;
					newpoolpoints[el] = event.target.value
					setEditSelected({
						...editSelected, 
						poolpoints: newpoolpoints
					})
					}} />
				</Form.Group></Col>))}
				
			</Row>
			<Row><Col><Form.Group>
				<Form.Label>URL to problem statement PDF</Form.Label>
				<Form.Control type="text" placeholder="URL" value={editSelected.link} onChange={(event) => {setEditSelected({...editSelected, link:event.target.value})}} />
			</Form.Group></Col></Row>
		</Container>
		<Button onClick={() => {
			console.log(editSelected);
			setResponse("Waiting...");
			(async () => {
				const temp = await (await fetch("/api/edit/", {
					method: "POST",
					mode: "cors",
					headers: {"Content-Type":"application/json"},
					body: JSON.stringify({...editSelected, password: password})
				})).json();
				setResponse(temp[0]);
				setRefresh(!refresh); //refresh leaderboard
				setDelSelected({
					_id: "",
					...empty
				});
				setEditSelected({
					_id: "",
					...empty});
			})();
		}}>Submit Edit</Button>
		</Tab>
		<Tab eventKey="delete" title="Delete Events">
		<p>Delete event:</p>
		<p>Click on an event in the table above to select it for deleting, then click the delete button.</p>
		<p>Event selected for deletion:</p>
		<Container>
			<Row>
			
				<Col sm={1}><Form.Group>
					<Form.Label >P.S. Category</Form.Label>
					<Form.Select value={delSelected.eventcategory}>
						<option value=""></option>
						{leaderboard.categories.map(el => (
							<option value={el}>{el}</option>
						))}
					</Form.Select>
				</Form.Group></Col>
				
				<Col sm={1}><Form.Group>
					<Form.Label>P.S. Name</Form.Label>
					<Form.Control type="text" placeholder="" value={delSelected.eventname} />
				</Form.Group></Col>
				
				{leaderboard.pools.map(el => (
				<Col><Form.Group>
					<Form.Label>{el} Points</Form.Label>
					<Form.Control type="number" placeholder="" value={delSelected.poolpoints[el]} />
				</Form.Group></Col>))}
				
			</Row>
			<Row><Col><Form.Group>
				<Form.Label>URL to problem statement PDF</Form.Label>
				<Form.Control type="text" placeholder="URL" value={delSelected.link} />
			</Form.Group></Col></Row>
		</Container>
		<Button onClick={() => {
			console.log(delSelected);
			setResponse("Waiting...");
			(async () => {
				const temp = await (await fetch("/api/delete/", {
					method: "POST",
					mode: "cors",
					headers: {"Content-Type":"application/json"},
					body: JSON.stringify({...delSelected, password: password})
				})).json();
				setResponse(temp[0]);
				setRefresh(!refresh); //refresh leaderboard
				setDelSelected({
					_id: "",
					...empty
				});
				setEditSelected({
					_id: "",
					...empty
				});
			})();
		}}>Delete</Button>
		</Tab>
		</Tabs>
		</div>
	);
}

export default App;
