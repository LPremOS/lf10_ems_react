type SubmitButtonProps = {
    text : string,
}

export function SubmitButton(props : SubmitButtonProps) {
    return(
        <>
        <div className="d-grid gap-2">
            <button type="submit" className="btn btn-primary fw-medium">{props.text}</button>
        </div>
        </>
    );
}