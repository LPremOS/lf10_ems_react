import { Container } from "react-bootstrap";
import { InputField } from "../components/common/InputField";
import { SubmitButton } from "../components/common/SubmitButton";
import { useState, type FormEvent } from "react";

export function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const handleSubmit = (e: FormEvent) => {
        // TODO: Backend Anbindung
    }

    return(
        <>
        <Container className="loginContainer text-center m-auto">
            <form onSubmit={handleSubmit}>
                <h4 className="text-primary fw-bold">HiTec GmbH</h4>
                <h2 className="fw-bold">Willkommen zurück</h2>
                <p className="mb-4 text-black-50">Melden Sie sich an, um fortzufahren.</p>
            
                <InputField type="text" id="UsernameInput" placeholder="Ihre E-Mail-Adresse" label="Benutzername / E-Mail" value={username} onChange={(e) => setUsername(e.target.value)} />
                <InputField type="password" id="PasswordInput" placeholder="Ihr Passwort" label="Passwort" showToggle={true} value={password} onChange={(e) => setPassword(e.target.value)} />
                <SubmitButton text="Anmelden"/>
            </form>
        </Container>
        </>
    )
}