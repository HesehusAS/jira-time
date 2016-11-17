import { connect } from 'react-redux';
import { setAuthenticationHash } from 'store/app';
import { setLoggedIn } from 'routes/Profile/modules/profile';

import Login from '../components/Login';

const mapStateToProps = (state) => ({
  username: state.profile.username
});

const mapDispatchToProps = {
  setLoggedIn,
  setAuthenticationHash
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
