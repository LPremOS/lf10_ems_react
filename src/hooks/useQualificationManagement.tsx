import { useEffect, useState } from "react";
import { useQualifiactionApi } from "./useQualificationApi";
import type { QualificationType } from "../types/QualificationType";

export type EnsureQualificationResult =
    | { success: true; qualification: QualificationType; created: boolean }
    | { success: false; error: string };

export function useQualificationManagement() {
    const {fetchQualifications, addQualification, deleteQualification, editQualification, loading, error} = useQualifiactionApi();
    const [qualifications, setQualifications] = useState<QualificationType[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [skillInput, setSkillInput] = useState('');
    const [modalMode, setModalMode] = useState<'add' | 'edit' | 'delete'>('add');
    const [selectedQualification, setSelectedQualification] = useState<QualificationType | null>(null);

    const loadQualifications = async (): Promise<QualificationType[]> => {
        const data = await fetchQualifications();
        if (Array.isArray(data)) {
            setQualifications(data);
            return data;
        }
        return [];
    };

    useEffect(() => {
        loadQualifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
        const normalizedSkill = skillInput.trim();
        let resultSuccess = true;

        if (modalMode === 'add') {
            const result = await addQualification(normalizedSkill);
            resultSuccess = result.success;
        } else if (modalMode === 'edit' && selectedQualification) {
            const result = await editQualification(selectedQualification.id, normalizedSkill);
            resultSuccess = result.success;
        } else if (modalMode === 'delete' && selectedQualification) {
            const result = await deleteQualification(selectedQualification.id);
            resultSuccess = result.success;
        }

        if (!resultSuccess) {
            return;
        }

        closeModal();
        await loadQualifications();
    };

    const ensureQualification = async (skillName: string): Promise<EnsureQualificationResult> => {
        const normalizedSkill = skillName.trim();
        if (!normalizedSkill) {
            return { success: false, error: "Bitte geben Sie eine Qualifikation ein." };
        }

        const existingQualification = qualifications.find(
            (qualification) => qualification.skill.toLowerCase() === normalizedSkill.toLowerCase(),
        );
        if (existingQualification) {
            return { success: true, qualification: existingQualification, created: false };
        }

        const createResult = await addQualification(normalizedSkill);
        if (!createResult.success) {
            return { success: false, error: createResult.error };
        }

        const refreshedQualifications = await loadQualifications();
        const createdQualification = refreshedQualifications.find(
            (qualification) => qualification.skill.toLowerCase() === normalizedSkill.toLowerCase(),
        );

        if (createdQualification) {
            return { success: true, qualification: createdQualification, created: true };
        }

        const fallbackQualification = createResult.data;
        setQualifications((previous) =>
            previous.some((qualification) => qualification.id === fallbackQualification.id)
                ? previous
                : [...previous, fallbackQualification],
        );
        return { success: true, qualification: fallbackQualification, created: true };
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
        ensureQualification,
        getModalTitle,
        getModalSaveText
    };
}
