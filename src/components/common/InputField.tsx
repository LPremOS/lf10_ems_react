import { useState } from "react";

type InputFieldProps = {
    type : string,
    id : string,
    placeholder : string,
    label: string,
    showToggle?: boolean,
    value:string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function InputField(props : InputFieldProps) {
    const [showPassword, setShowPassword] = useState(false);
    const inputType = props.showToggle ? (showPassword ? "text" : "password") : props.type;

    return(
        <>
        <label
            className="form-label fw-medium text-start d-block"
            htmlFor={props.id}
        >{props.label}</label>

        <div className="position-relative" style={props.showToggle ? { marginBottom: '1rem' } : undefined}>
            <input
                className="form-control mb-3"
                id={props.id}
                type={inputType}
                required
                placeholder={props.placeholder}
                value={props.value}
                onChange={props.onChange}
                        style={props.showToggle ? { paddingRight: '2.5rem' } : undefined}></input>
            {props.showToggle && (
                <button
                    type="button"
                    className="btn btn-link position-absolute end-0 top-0 text-muted"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ textDecoration: 'none', padding: '0.375rem 0.75rem' }}
                    tabIndex={-1}
                >
                    {showPassword ? <i className="bi bi-eye-slash"></i> : <i className="bi bi-eye"></i>}
                </button>
            )}
        </div>     
        </>
    )
}