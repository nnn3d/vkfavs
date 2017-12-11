import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as $ from 'jquery'
import Separator from '../components/Separator'
import NewFolder from '../components/NewFolder'
import Folders from '../components/Folders'
import menuActions, { ImenuActions } from '../actions/menuActions'
import { ImenuReducer } from '../reducers/menu'

interface IAppProps extends React.Props<any> {
  menu: ImenuReducer;
  actions: ImenuActions;
}

function mapStateToProps(state) {
  return {
    menu: state.menu
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(menuActions, dispatch)
  }
}

class App extends React.Component<IAppProps, void> {

  componentDidUpdate() {
    $(ReactDOM.findDOMNode(this.refs['favmenu'])).find('*[data-onclick]').each((index, element) => {
      $(element).attr('onclick', $(element).attr('data-onclick'));
    })
  }

  render() {
    const { menu, actions } = this.props
    var separatorVisible = false;

    menu && menu.folders.map( (name, id, array) => {
      if (name) separatorVisible = true;
    })

    return (
      <div 
        ref="favmenu" 
        className="page_block ui_rmenu vkf_menu_wrap" 
        onClick={ (e) => {e.preventDefault();} }
      >
        <div className='vkf_menu'>
          <div className='ui_rmenu_slider _ui_rmenu_slider'></div>
          <a id="ui_rmenu_likes_posts" href="/fave?section=likes_posts" className="ui_rmenu_item _ui_item_likes_posts" role="listitem" data-onclick="return uiRightMenu.go(this, event);">
            <span>Все записи</span>
          </a>
          { separatorVisible && <Separator /> }
          <Folders {...actions} {...menu} handlerClickFun={()=>{}}/>
        </div>
        <NewFolder addFolderFun={actions.addFolderFun} />
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)