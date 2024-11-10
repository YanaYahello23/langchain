"use client"

import Image from "next/image";
import logo from "./assets/logo.webp";
import {useChat} from "ai/react";
import {Message} from "ai";
import PromptSuggestionsRow from "./components/PromptSuggestionsRow";
import LoadingBubble from "./components/LoadingBubble";
import Bubble from "./components/Bubble";

const Home = () => {
    const {append, input, messages, isLoading, handleInputChange, handleSubmit} = useChat();
    const noMessages = !messages?.length;

    const handlePrompt = (promptText: string) => {
      const message: Message = {
          id: crypto.randomUUID(),
          content: promptText,
          role: "user",
      }
       append(message);
    };

    return (
        <main>
            <Image src={logo} width="100" alt="logo"/>
            <section className={noMessages ? "" : "populated"}>
                {
                    noMessages ?
                        (<>
                            <p className="starter-text">
                                The Ultimate place for developers which are fans of learning new things!
                                Ask GPT something about LangChain or OpenAI and it will
                                become with most up-to-date answer.
                                We hope you enjoy!
                            </p>
                            <br/>
                            <PromptSuggestionsRow onPromptClick={handlePrompt}/>
                        </>)
                        :

                        (<>
                            {messages.map((message, index) => <Bubble key={`message-${index}`} message={message}/>)}
                            {isLoading && <LoadingBubble/>}
                        </>)
                }
            </section>

            <form onSubmit={handleSubmit}>

                <input className="question-box" onChange={handleInputChange} value={input}
                       placeholder="Ask me something..."/>
                <input type="submit"/>
            </form>
        </main>
    )
}

export default Home;