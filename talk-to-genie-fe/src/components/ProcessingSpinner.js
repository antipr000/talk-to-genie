import { Spinner } from "@blueprintjs/core"

const ProcessingSpinner = ({}) => {
    return (
        <div className="d-flex fw" style={{ gap: "10px", justifyContent: "center", alignItems: "center" }}>
            <Spinner intent="success"/>
            <span> Processing your request, please wait! </span>
        </div>
    )
}

export default ProcessingSpinner;