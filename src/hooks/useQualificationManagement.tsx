import { useCallback, useEffect, useState } from "react";
import { useQualificationApi } from "./useQualificationApi";
import type { QualificationType } from "../types/QualificationType";
import { useEmployeeManagement } from "./useEmployeeManagement";
import { useEmployeeApi } from "./useEmployeeApi";

export type EnsureQualificationResult =
    | { success: true; qualification: QualificationType; created: boolean }
    | { success: false; error: string };

type ModalMode = "add" | "edit" | "delete";
type SaveVariant = "primary" | "danger";

export function useQualificationManagement() {
    const {
        fetchQualifications,
        addQualification,
        deleteQualification,
        editQualification,
        loading,
        error,
    } = useQualificationApi();
    const { employees } = useEmployeeManagement();
    const { deleteQualificationFromEmployee } = useEmployeeApi();

    const [qualifications, setQualifications] = useState<QualificationType[]>([]);
    const [saveVariant, setSaveVariant] = useState<SaveVariant>("primary");
    const [showModal, setShowModal] = useState(false);
    const [skillInput, setSkillInput] = useState("");
    const [modalMode, setModalMode] = useState<ModalMode>("add");
    const [selectedQualification, setSelectedQualification] = useState<QualificationType | null>(null);
    const [employeeCountWithQualification, setEmployeeCountWithQualification] = useState(0);

    const loadQualifications = useCallback(async (): Promise<QualificationType[]> => {
        const data = await fetchQualifications();
        if (!Array.isArray(data)) {
            return [];
        }

        setQualifications(data);
        return data;
    }, [fetchQualifications]);

    useEffect(() => {
        loadQualifications();
    }, [loadQualifications]);

    const openAddModal = () => {
        setModalMode("add");
        setSaveVariant('primary');
        setSkillInput("");
        setSelectedQualification(null);
        setShowModal(true);
    };

    const openEditModal = (qualification: QualificationType) => {
        setModalMode("edit");
        setSaveVariant('primary');
        setSkillInput(qualification.skill);
        setSelectedQualification(qualification);
        setShowModal(true);
    };

    const openDeleteModal = (qualification: QualificationType) => {
        setModalMode("delete");
        setSaveVariant('danger');
        setSkillInput("");
        setSelectedQualification(qualification);

        const count = employees.filter(e =>
            e.qualifikationen.includes(qualification.skill)
        ).length;
        setEmployeeCountWithQualification(count);

        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSkillInput("");
        setSelectedQualification(null);
    };

    const saveQualification = async () => {
        const normalizedSkill = skillInput.trim();

        if (modalMode === "add") {
            const result = await addQualification(normalizedSkill);
            if (!result.success) {
                return;
            }
        } else if (modalMode === "edit" && selectedQualification) {
            const result = await editQualification(selectedQualification.id, normalizedSkill);
            if (!result.success) {
                return;
            }
        } else if (modalMode === "delete" && selectedQualification) {
            if(employeeCountWithQualification > 0) {
                const affectedEmployees = employees.filter(e =>
                e.qualifikationen.includes(selectedQualification.skill)
                );

                for(const employee of affectedEmployees) {
                    await deleteQualificationFromEmployee(employee.id, selectedQualification.id);
                }
            }

            const result = await deleteQualification(selectedQualification.id);
            if (!result.success) {
                return;
            }
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
            (qualification) =>
                qualification.skill.toLowerCase() === normalizedSkill.toLowerCase(),
        );

        if (existingQualification) {
            return {
                success: true,
                qualification: existingQualification,
                created: false,
            };
        }

        const createResult = await addQualification(normalizedSkill);
        if (!createResult.success) {
            return { success: false, error: createResult.error };
        }

        const refreshedQualifications = await loadQualifications();
        const createdQualification = refreshedQualifications.find(
            (qualification) =>
                qualification.skill.toLowerCase() === normalizedSkill.toLowerCase(),
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

    const getModalTitle = () => {
        if (modalMode === "add") return "Neue Qualifikation";
        if (modalMode === "edit") return "Qualifikation bearbeiten";
        return "Qualifikation löschen";
    };

    const getModalSaveText = () => {
        return modalMode === "delete" ? "Löschen" : "Speichern";
    };

    return {
        qualifications,
        loading,
        error,
        showModal,
        modalMode,
        selectedQualification,
        skillInput,
        employeeCountWithQualification,
        setSkillInput,
        openAddModal,
        openEditModal,
        openDeleteModal,
        saveVariant,
        closeModal,
        saveQualification,
        ensureQualification,
        getModalTitle,
        getModalSaveText,
    };
}
