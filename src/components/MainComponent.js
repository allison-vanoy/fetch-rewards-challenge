import React, { Component } from 'react';
import { Table } from 'reactstrap';

function TableRows(props) {
	let listIds = [];

	//find unique listIds and add to sorted listIds array to use for primary groups
	const ListIdVals = () => {
		props.hiringList.map((item) => {

		if (item.name !== '' && item.name !== null) {
			if (!listIds.includes(item.listId)) {
				listIds.push(item.listId);
				listIds.sort();
			}
		}
	})}

	//return array of row contents that matches the group value currently being looped over
	//and leave out any with no name contents
	const filterHiringList = (val) => {
		return props.hiringList.filter(i => (i.listId === val) && (i.name !== '' && i.name !== null));
	}

	const groupContents = () => {
		ListIdVals();

		return (
			listIds.map(val => {
				let listArr = filterHiringList(val);

				//sort this section of the list by name, splitting out the "Item" string so numbers are compared
				listArr.sort(function(a, b) {
					let splitA = parseInt(a.name.split(' ')[1]);
					let splitB = parseInt(b.name.split(' ')[1]);

					if (splitA < splitB) return -1 
					if (splitA > splitB) return 1
					return 0;
				});

				return (
					<React.Fragment>
						<tr key={val} className="groupTitle">
							<td colSpan="2" id={val} onClick={props.addCollapsed}>
								<i className={(props.collapsed.includes(val)) ? "fa fa-angle-right" : "fa fa-angle-down"} />{' '}
								{`Group ${val}`}
							</td>
						</tr>
						{listArr.map(row => {
							return (
								<tr key={row.id} className={(props.collapsed.includes(val)) ? "hideRow" : "showRow"}>
									<td>{row.listId}</td>
									<td>{row.name}</td>
								</tr>
							)
						})}
					</React.Fragment>
				)
			})
		)
	}

	return (
		groupContents()
	);
}

class HiringList extends Component {
	constructor(props) {
		super(props);

		this.state = {
			error: null,
			isLoading: false,
			hiringList: [],
			collapsed: []
		};
	}

	componentDidMount() {
		fetch("https://cors-anywhere.herokuapp.com/https://fetch-hiring.s3.amazonaws.com/hiring.json")
		.then(response => response.json())
		.then(
			(result) => {
				this.setState({
					isLoaded: true,
					hiringList: result
				});
			},
			(error) => {
				this.setState({
					isLoaded: true,
					error
				});
			}
		)
	}

	//create array in collapsed state with id of clicked group rows to collapse change class names
	//of corresponding rows to hide and remove id from state when clicked again to unhide
	addCollapsed = (e) => {
		const targetId = parseInt(e.target.id);
		let collapsedArr = [];
		if (this.state.collapsed.includes(targetId)) {
			let arrIndex = this.state.collapsed.indexOf(targetId);
			collapsedArr = this.state.collapsed.splice(arrIndex, 1);
		} else {
			collapsedArr = this.state.collapsed.push(targetId);
		}

		this.setState({ collapsedArr })
	}

	render() {
		const { error, isLoaded, hiringList, collapsed } = this.state;
		
		if (error) {
			return <div>{`Could not load content due to error: ${error.message}`}</div>
		} else if (!isLoaded) {
			return <div>Loading</div>
		} else {
			return (
				<Table bordered striped className="container">
					<thead>
						<tr>
							<th>ListId</th>
							<th>Name</th>
						</tr>
					</thead>
					<tbody>
						<TableRows hiringList={hiringList} collapsed={collapsed} addCollapsed={(e) => this.addCollapsed(e)} />
					</tbody>
				</Table>
			)
		}
	}
}

export default HiringList;