import React, { Component } from "react";

const _default = [{ key: "", value: "" }];

class KeyList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: props.items.length !== 0 ? props.items : _default
    };

    this.handleAddClick = this.handleAddClick.bind(this);
    this.handleRemoveClick = this.handleRemoveClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }


  componentWillReceiveProps(nextProps) {
    this.setState({
      items: nextProps.items.length !== 0 ? nextProps.items : _default
    });
  }

  handleAddClick(event) {
    let { items } = this.state;
    items = items.concat([{ key: "", value: "" }]);
    this.setState({ items });
  }

  handleRemoveClick(event, index) {
    const { onItemChanged } = this.props;
    let { items } = this.state;
    items = items.filter((item, i) => {
      return index !== i;
    });
    if (onItemChanged) {
      onItemChanged(items);
    }
    this.setState({ items });
  }

  handleChange(event, index, name) {
    const { onItemChanged } = this.props;
    let { items } = this.state;
    items[index][name] = event.target.value;
    if (onItemChanged) {
      onItemChanged(items);
    }
    this.setState({ items });
  }

  render() {
    const { items } = this.state;
    const { separator } = this.props;
    return (
      <div className="key-list">
        {items.map((item, index) =>
          <div key={index} className="item">
            <input
              className="key"
              value={item.key}
              placeholder=" - enter key - "
              onChange={event => this.handleChange(event, index, "key")}
            />
            <span>
              {separator || ":"}
            </span>
            <input
              className="value"
              value={item.value}
              placeholder=" - enter value - "
              onChange={event => this.handleChange(event, index, "value")}
            />
            {index === 0
              ? <button type="button" onClick={this.handleAddClick}>
                  +
                </button>
              : <button
                  type="button"
                  onClick={event => {
                    this.handleRemoveClick(event, index);
                  }}
                >
                  -
                </button>}
          </div>
        )}
      </div>
    );
  }
}

export default KeyList;