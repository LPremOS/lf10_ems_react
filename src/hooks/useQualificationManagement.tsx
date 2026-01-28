import { useEffect, useState } from "react";
import { useQualifiactionApi } from "./useQualificationApi";
import type { QualificationType } from "../types/QualificationType";

export function useQualificationManagement() {
    const {fetchQualifications, addQualification, deleteQualification, editQualification, loading, error} = useQualifiactionApi();
    const [qualifications, setQualifications] = useState<QualificationType[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [skillInput, setSkillInput] = useState('');
    const [modalMode, setModalMode] = useState<'add' | 'edit' | 'delete'>('add');
    const [selectedQualification, setSelectedQualification] = useState<QualificationType | null>(null);

    useEffect(() => {
        loadQualifications();
    }, []);

    const loadQualifications = async () => {
        const data = await fetchQualifications();
        if (Array.isArray(data)) {
            setQualifications(data);
        }
    };

    const openAddModal = () => {
        setModalMode('add');
        setSkillInput("");
        setShowModal(true);
    }
    const openEditModal = (q: QualificationType) => {
        setModalMode('edit');
        setSkillInput(q.skill);
        setSelectedQualification(q);
        setShowModal(true);
    }
    const openDeleteModal = (q: QualificationType) => {
        setModalMode('delete');
        setSelectedQualification(q);
        setShowModal(true);
    }

    const saveQualification = async () => {
        if (modalMode === 'add') {
            console.log("Neue Qualifikation:", skillInput);
            await addQualification(skillInput);
        } else if (modalMode === 'edit' && selectedQualification) {
            console.log("Bearbeite:", selectedQualification.id, skillInput);
            await editQualification(selectedQualification.id, skillInput);
        } else if (modalMode === 'delete' && selectedQualification) {
            console.log("Lösche:", selectedQualification.id);
            await deleteQualification(selectedQualification?.id);
        }
        closeModal();
        await loadQualifications();
    };

    const closeModal = () => {
        setShowModal(false);
    }

    const getModalTitle = () => {
        if (modalMode === 'add') return "Neue Qualifikation";
        if (modalMode === 'edit') return "Qualifikation bearbeiten";
        return "Qualifikation löschen";
    };

    const getModalSaveText = () => {
        return modalMode === 'delete' ? "Löschen" : "Speichern";
    };

    return {
        qualifications,
        loading,
        error,
        showModal,
        modalMode,
        selectedQualification,
        skillInput,
        setSkillInput,
        openAddModal,
        openEditModal,
        openDeleteModal,
        closeModal,
        saveQualification,
        getModalTitle,
        getModalSaveText
    };
}