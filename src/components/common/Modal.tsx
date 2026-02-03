import { Button, Modal } from "react-bootstrap";

type CustomModalProps = {
    show : boolean;
    onClose: () => void;
    onSave: () => void;
    title:string;
    children: React.ReactNode;
    saveButtonText?: string;
    cancelButtonText?:string;
    saveVariant?: "primary" | "secondary" | "danger" | "success";
    isBusy?: boolean;
    saveDisabled?: boolean;
    cancelDisabled?: boolean;
}

export function CustomModal({
        show,
        onClose,
        onSave,
        title,
        children,
        saveButtonText = 'Speichern',
        cancelButtonText = 'Abbrechen',
        saveVariant = "primary",
        isBusy = false,
        saveDisabled = false,
        cancelDisabled = false,
    } : CustomModalProps) {
            return(
                <>
                <Modal show={show} onHide={isBusy ? undefined : onClose} centered backdrop={isBusy ? "static" : true} keyboard={!isBusy}>
                    <Modal.Header closeButton={!isBusy}>
                        <Modal.Title>{title}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{children}</Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={onClose} disabled={isBusy || cancelDisabled}>
                            {cancelButtonText}
                        </Button>
                        <Button variant={saveVariant} onClick={onSave} disabled={isBusy || saveDisabled}>
                            {saveButtonText}
                        </Button>
                    </Modal.Footer>
                </Modal>
                </>
            );
        }
