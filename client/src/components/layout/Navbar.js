import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { logoutUser } from '../../actions/authActions'
import { clearCurrentProfile } from '../../actions/profileActions'

class Navbar extends Component {

  onLogoutClick(e) {
	e.preventDefault()
	this.props.logoutUser()
	this.props.clearCurrentProfile()
  }

  render() {

	const { isAuthenticated, user } = this.props.auth

	const authLinks = (
	  <ul className='navbar-nav ml-auto'>
		<li className='nav-item'>
		  <Link to='/dashboard'>
			<img className='rounded-circle' src={user.avatar} alt={user.name} title="Requires Gravatar connected email" 
			style={{ width: '25px', marginRight: '5px' }}/>
		  </Link>
		</li>
		<li className='nav-item'>
		  <a href='#logout' onClick={this.onLogoutClick.bind(this)} className='nav-link' style={{display: 'inline'}}>
 			Log Out
		  </a>
		</li>
	  </ul>
	)

	const guestLinks = (
	  <ul className='navbar-nav ml-auto'>
		<li className='nav-item'>
		  <Link className='nav-link' to='/register'>
		  	Sign Up
		  </Link>
		</li>
		<li className='nav-item'>
		  <Link className='nav-link' to='/login'>
			Login
		  </Link>
		</li>
	  </ul>
	)

	return (
	  <div>
		<nav className='navbar navbar-expand-sm navbar-dark bg-dark mb-4'>
		  <div className='container'>

			<Link className='navbar-brand' to='/'>
			  DevConnector
			</Link>
			<button className='navbar-toggler' type='button' data-toggle='collapse' data-target='#mobile-nav'>
			  <span className='navbar-toggler-icon'></span>
			</button>

			<div className='collapase navbar-collapse' id='mobile-nav'>
			  <ul className='navbar-nav mr-auto'>
				<li className='nav-item'>
				  <Link className='nav-link' to='/profiles'>
					{'  '}
					Developers
				  </Link>
				</li>
			  </ul>

			  {isAuthenticated ? authLinks : guestLinks}
			
			</div>

		  </div>

		</nav>
	  </div>
	)
  }
}

Navbar.propTypes = {
  logoutUser: PropTypes.func.isRequired,
  clearCurrentProfile: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
  auth: state.auth
})

export default connect(mapStateToProps, { logoutUser, clearCurrentProfile })(Navbar)
