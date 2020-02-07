import * as React from 'react';
import Autosuggest from 'react-autosuggest';

export interface AutoCompleteTextInputProps {
  getSuggestions: (value) => Promise<Suggestion[]>;
  getSuggestionValue: (suggestion: Suggestion) => string;
  renderSuggestion: (suggestion: Suggestion) => React.ReactNode;
  onChange: (value: string) => void;
}

export interface AutoCompleteTextInputState {
  value: string;
  suggestions: any[];
}

export interface Suggestion {
  [key: string]: any;
}


export default class AutoCompleteTextInput extends React.Component<AutoCompleteTextInputProps, AutoCompleteTextInputState> {
  constructor(props: AutoCompleteTextInputProps) {
    super(props);

    this.state = {
      value: "",
      suggestions: []
    };
  }

  onChange = (event, { newValue }) => {
    this.setState({
      value: newValue as string
    }, () => {
        this.props.onChange(this.state.value)
    });
  };

  // Autosuggest will call this function every time you need to update suggestions.
  // You already implemented this logic above, so just use it.
  onSuggestionsFetchRequested = ({ value }) => {
    this.props.getSuggestions(value)
      .then(suggestions => {
        this.setState({ suggestions });
      })
      .catch(err => console.log(err));

  };

  // Autosuggest will call this function every time you need to clear suggestions.
  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: [] as Suggestion[]
    });
  };

  render() {
    const { value, suggestions } = this.state;

    // Autosuggest will pass through all these props to the input.
    const inputProps = {
      style: {
        width: "100%"
      },
      placeholder: "search...",
      value,
      onChange: this.onChange
    };

    // Finally, render it!
    return (
      <Autosuggest
        theme={{
          container: "react-autosuggest__container",
          containerOpen: "react-autosuggest__container--open",
          input: "react-autosuggest__input",
          inputOpen: "react-autosuggest__input--open",
          inputFocused: "react-autosuggest__input--focused",
          suggestionsContainer: "react-autosuggest__suggestions-container",
          suggestionsContainerOpen:
            "react-autosuggest__suggestions-container--open",
          suggestionsList: "react-autosuggest__suggestions-list",
          suggestion: "react-autosuggest__suggestion",
          suggestionFirst: "react-autosuggest__suggestion--first",
          suggestionHighlighted: "react-autosuggest__suggestion--highlighted",
          sectionContainer: "react-autosuggest__section-container",
          sectionContainerFirst: "react-autosuggest__section-container--first",
          sectionTitle: "react-autosuggest__section-title"
        }}
        suggestions={suggestions}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        getSuggestionValue={this.props.getSuggestionValue}
        renderSuggestion={this.props.renderSuggestion}
        onSuggestionSelected={(
          e,
          { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }
        ) => {}}
        // onSuggestionHighlighted={suggestion => {}}
        alwaysRenderSuggestions={true}
        renderInputComponent={inputProps => (
          <div>
            <input
              style={{
                width: "100%"
              }}
              {...inputProps}
            />
          </div>
        )}
        inputProps={inputProps}
      />
    );
  }
}

