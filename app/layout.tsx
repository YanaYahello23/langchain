import "./global.css";

export const metadata = {
    title: "OpenAI LangChain",
    description: "The place for questions related to OpenAI news and LangChain",
}

const RootLayout = ({children}) => {
    return (
        <html
        >
        <body>
        {children}
        </body>
        </html>
    )
}

export default RootLayout;