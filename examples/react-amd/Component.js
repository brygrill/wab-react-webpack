// Expose as AMD module
// Could import JS API like normal
// Create React class with constructor

// Load External Libs
require({
  paths: {
    react:
      'https://cdnjs.cloudflare.com/ajax/libs/react/16.0.0/umd/react.production.min',
    'react-bootstrap':
      'https://cdnjs.cloudflare.com/ajax/libs/react-bootstrap/0.31.3/react-bootstrap.min',
    propTypes: 'https://unpkg.com/prop-types@15.6.0/prop-types.min',
    lodash: 'https://unpkg.com/lodash@4.17.4/lodash',
  },
});

// Styles
const maintStyles = {
  paddingTop: '1rem',
};

// High level react container for View tab
define(
  [
    'react',
    'propTypes',
    'react-bootstrap',
    'lodash',
    './WorkflowRouter',
    './AlertMsgComponent',
    './LoadingComponent',
  ],
  (React, PropTypes, Boot, _, WorkflowRouter, AlertMsg, Loader) => {
    class ViewContainer extends React.Component {
      constructor(props) {
        super(props);
        this.handleGoBackBtn = this.handleGoBackBtn.bind(this);
        this.handleCancelBtn = this.handleCancelBtn.bind(this);
        this.handleSelectTree = this.handleSelectTree.bind(this);
        this.handleShowAttrs = this.handleShowAttrs.bind(this);
        this.showAlertMsg = this.showAlertMsg.bind(this);
        this.resetState = this.resetState.bind(this);
        this.state = {
          loading: false, // show loader, invoked when fetching attr data
          workflowState: 'select', // used to trigger ui update on router - select, attributes
          currentTreeAttrs: null, // tree user selected from search
          currentTreeId: null, // CT_Tag_ID used for titling components
          successAlert: false, // show success message?
          successMsg: 'Success', // success message text
          error: false, // show error message?
        };
      }

      componentWillReceiveProps(nextProps) {
        // if the focused graphic changes fire function to find and
        // display attributes
        if (nextProps.graphicID !== this.props.graphicID) {
          this.handleShowAttrs(nextProps.graphicID, nextProps.treesData);
        }

        if (nextProps.editSuccess !== this.props.editSuccess) {
          this.showAlertMsg('Tree Updated!');
        }
      }

      handleShowAttrs(treeid, data) {
        this.setState({ loading: true });
        // Find the attributes by tree id and pass down
        const attrs = this.props.typeahead.FindTree(
          treeid,
          data,
          this.props.treeIDField,
        );
        if (attrs) {
          this.handleSelectTree(attrs);
        } else {
          this.setState({
            currentTreeAttrs: {},
            currentTreeId: null,
            workflowState: 'attributes',
            loading: false,
          });
        }
      }

      handleSelectTree(allTreeAttrs) {
        // Pick only desired fields to display
        this.setState({
          currentTreeAttrs: _.pick(allTreeAttrs, this.props.attrDisplayFields),
          currentTreeId: allTreeAttrs[this.props.treeIDField],
          workflowState: 'attributes',
          loading: false,
        });
      }

      handleGoBackBtn() {
        this.setState({ workflowState: 'select' });
      }

      handleCancelBtn() {
        this.resetState();
      }

      showAlertMsg(successMsg) {
        this.setState({ successAlert: true, successMsg });
        setTimeout(() => {
          this.setState({ successAlert: false });
        }, 3000);
      }

      resetState() {
        this.setState({
          workflowState: 'select',
          currentTreeAttrs: null,
          currentTreeId: null,
          error: false,
        });
      }

      render() {
        const { successAlert, successMsg, error, loading } = this.state;
        return this.props.loading || loading ? (
          <Loader msg="Loading Attributes..." />
        ) : (
          <div style={maintStyles}>
            <div>
              <Boot.Row>
                <AlertMsg
                  isMobile={this.props.isMobile}
                  display={successAlert}
                  bsStyle="success"
                  msg={successMsg}
                />
                <AlertMsg
                  isMobile={this.props.isMobile}
                  display={error}
                  bsStyle="danger"
                  msg="Something went wrong!"
                />
              </Boot.Row>
              <Boot.Row>
                <Boot.Col xs={12}>
                  <WorkflowRouter
                    isMobile={this.props.isMobile}
                    graphicID={this.props.graphicID}
                    treeIDField={this.props.treeIDField}
                    workflowState={this.state.workflowState}
                    handleGoBackBtn={this.handleGoBackBtn}
                    handleCancelBtn={this.handleCancelBtn}
                    QRScanner={this.props.QRScanner}
                    resultListIcon="list"
                    handleSelectResult={this.handleSelectTree}
                    treeAttributes={this.state.currentTreeAttrs}
                    currentTreeId={this.state.currentTreeId}
                    treesData={this.props.treesData}
                    typeahead={this.props.typeahead}
                  />
                </Boot.Col>
              </Boot.Row>
            </div>
          </div>
        );
      }
    }

    ViewContainer.propTypes = {
      // App Props
      loading: PropTypes.bool.isRequired,
      isMobile: PropTypes.object.isRequired,
      editSuccess: PropTypes.bool.isRequired,
      // Map Props
      treeIDField: PropTypes.string.isRequired,
      // Search Props
      typeahead: PropTypes.object.isRequired,
      treesData: PropTypes.array.isRequired,
      QRScanner: PropTypes.func.isRequired,
      // Attribute Props
      attrDisplayFields: PropTypes.array.isRequired,
      graphicID: PropTypes.string.isRequired,
    };

    return ViewContainer;
  },
);
