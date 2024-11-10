import PromptsSuggestionButton from "./PromptsSuggestionButton";

const PromptSuggestionsRow = ({onPromptClick}) => {
    const prompts = [
        "What is Lang Chain",
        "What is AI",
        "When AI was started"
    ];


    return (
        <div className="prompt-suggestion-row">
            {prompts.map((prompt, index) =>
                <PromptsSuggestionButton
                    key={`suggestions-${index}`}
                    text={prompt}
                    onClick={() => onPromptClick(prompt)}/>)}
        </div>
    )
}

export default PromptSuggestionsRow;