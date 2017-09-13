import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import RaisedButton from 'material-ui/RaisedButton';
import { stateToData, stateToFields } from '../../utils';
import HoverPaper from '../../components/atoms/hover-paper';
import Header from '../../components/organisms/header';
import actions from './actions';
import styles from './styles';


const mapStateToProps = (state) => ({
  alertConfig: state.alertConfig.response,
});


@connect(mapStateToProps, actions)
class AlertConfig extends React.Component {
  static propTypes = {
    alertConfig: PropTypes.object,
    get: PropTypes.func.isRequired,
    params: PropTypes.object,
    set: PropTypes.func.isRequired,
  }

  static defaultProps = {
    alertConfig: {
      data: {
        fields: [],
        notification: {
          active: false,
          description: '',
          name: '',
        },
      },
    },
  }

  constructor(props) {
    super(props);

    this.state = {};

    this.handleSubmit = (event) => {
      event.preventDefault();
      const data = stateToData(this.state);
      this.props.set(this.props.params.alertId, data);
    };

    this.handleInputChange = (event, name) => {
      const result = {};
      result[name] = { ...this.state[name] };
      if (!result[name].current_value) {
        result[name].current_value = {};
      }
      result[name].current_value.value = event.target.value;
      this.setState({ ...result });
    };

    this.handleCheckboxChange = (event, value, name) => {
      const result = {};
      result[name] = { ...this.state[name] };
      result[name].is_enabled = value;
      this.setState({ ...result });
    };

    this.handleActiveChange = (event, active) => {
      this.setState({ active });
    };
  }

  componentWillMount() {
    this.props.get(this.props.params.alertId);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps && nextProps.alertConfig) {
      nextProps.alertConfig.data.fields.forEach((field) => {
        const data = {};
        data[field.field_name] = field;
        this.setState(data);
      });
      this.setState({ active: nextProps.alertConfig.data.notification.active });
    }
  }

  render() {
    const { alertConfig } = this.props;
    const data = stateToFields(this.state).map((settingName) => {
      const setting = this.state[settingName];
      return (
        <div key={settingName}>
          <Checkbox
            label={setting.description}
            style={styles.checkbox}
            checked={setting.is_enabled}
            onCheck={(event, value) => this.handleCheckboxChange(event, value, settingName)}
          />
          <input
            style={styles.number}
            type="number"
            min={
              setting.min_value
              ? Number(setting.min_value)
              : undefined
            }
            max={
              setting.max_value
              ? Number(setting.max_value)
              : undefined
            }
            defaultValue={
              setting.current_value ? Number(setting.current_value.value) : 0
            }
            onChange={(event) => this.handleInputChange(event, settingName)}
          />
          {setting.unit}
        </div>
      );
    });
    return (
      <div style={styles.root}>
        <Header back="/alerts/settings" disableInterval autoRefresh={false} />
        <HoverPaper style={styles.content}>
          <form onSubmit={this.handleSubmit}>
            <div style={styles.heading}>
              <div>
                <div style={styles.title}>
                  <h1>{alertConfig.data.notification.name}</h1>
                  <Checkbox
                    style={styles.title.checkbox}
                    checked={this.state.active}
                    onCheck={this.handleActiveChange}
                  />
                </div>
                <h4>{alertConfig.data.notification.description}</h4>
              </div>
              <RaisedButton label="save" type="submit" />
            </div>
            <TextField
              floatingLabelText="Who to alert:"
              floatingLabelFixed
              hintText="one@example.com, two@example.com, ..."
              fullWidth
              autoFocus
              style={styles.who}
            />
            <h4 style={styles.when}>When to alert</h4>
            {data}
          </form>
        </HoverPaper>
      </div>
    );
  }
}


export default AlertConfig;
