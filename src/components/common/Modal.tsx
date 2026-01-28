import { useState } from "react";
import { Button, Modal } from "react-bootstrap";

type CustomModalProps = {
    show : boolean;
    onClose: () => void;
    onSave: () => void;
    title:string;
    children: React.ReactNode;
    saveButtonText?: string;
    cancelButtonText?:string;
}

export function CustomModal({
        show,
        onClose,
        onSave,
        title,
        children,
        saveButtonText = 'Speichern',
        cancelButtonText = 'Abbrechen'
    } : CustomModalProps) {
            return(
                <>
                <Modal show={show} onHide={onClose} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>{title}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{children}</Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={onClose}>
                            {cancelButtonText}
                        </Button>
                        <Button variant="primary" onClick={onSave}>
                            {saveButtonText}
                        </Button>
                    </Modal.Footer>
                </Modal>
                </>
            );
        }