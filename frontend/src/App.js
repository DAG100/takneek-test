import {useState, useEffect} from "react";

function App() {
	const [leaderboard, setLeaderboard] = useState([]);
	const [refresh, setRefresh] = useState(false); //toggle for refreshing
	useEffect(async () => {
		fetch()
	}, [refresh]);
	
  return (
    <div className="main">
    	{
    		leaderboard === "error" 
    		? <div className="error">Something went wrong. Try refreshing using the button below.</div>
    		: <div className="leaderboard">
    			{leaderboard.map(el => (
    				<div>{el}</div>
    			))}
    		</div>
    	}
    </div>
  );
}

export default App;
