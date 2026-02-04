import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { CustomModal } from "../components/common/Modal";
import { useQualificationManagement } from "../hooks/useQualificationManagement";
import { useNotification } from "../components/common/NotificationProvider";
import type { Employee } from "../types/Employee";
import "./EmployeeForm.css";

export type EmployeeFormData = Omit<Employee, "id">;
type EmployeeFieldName = Exclude<keyof EmployeeFormData, "qualifikationen">;
type FormErrors = Partial<Record<EmployeeFieldName, string>>;

interface EmployeeFormProps {
    initialData?: EmployeeFormData | null;
    onSubmit: (data: EmployeeFormData) => void;
    isEdit?: boolean;
    isSubmitting?: boolean;
    apiError?: string | null;
    submitLabel?: string;
}

const POSTCODE_PATTERN = /^[0-9]{5}$/;
const PHONE_PATTERN = /^[0-9+()\-/\s]{6,20}$/;
const CREATE_QUALIFICATION_OPTION = "__create_new__";
const MIN_FORM_SCALE = 0.78;

function normalizeQualificationName(value: string): string {
    return value.trim();
}

function createInitialFormData(initialData?: EmployeeFormData | null): EmployeeFormData {
    return {
        vorname: initialData?.vorname ?? "",
        nachname: initialData?.nachname ?? "",
        telefonnummer: initialData?.telefonnummer ?? "",
        standort: initialData?.standort ?? "",
        street: initialData?.street ?? "",
        postcode: initialData?.postcode ?? "",
        qualifikationen: initialData?.qualifikationen ?? [],
    };
}

function validateForm(data: EmployeeFormData): FormErrors {
    const errors: FormErrors = {};

    if (!data.vorname.trim()) errors.vorname = "Bitte geben Sie einen Vornamen ein.";
    if (!data.nachname.trim()) errors.nachname = "Bitte geben Sie einen Nachnamen ein.";
    if (!data.standort.trim()) errors.standort = "Bitte geben Sie einen Ort ein.";
    if (!data.street.trim()) errors.street = "Bitte geben Sie eine Straße ein.";
    if (!POSTCODE_PATTERN.test(data.postcode.trim())) errors.postcode = "Bitte geben Sie eine 5-stellige PLZ ein.";
    if (!PHONE_PATTERN.test(data.telefonnummer.trim())) errors.telefonnummer = "Bitte geben Sie eine gültige Telefonnummer ein.";

    return errors;
}

export function EmployeeForm({
    initialData,
    onSubmit,
    isEdit = false,
    isSubmitting = false,
    apiError = null,
    submitLabel,
}: EmployeeFormProps) {
    const navigate = useNavigate();
    const {
        qualifications,
        loading: qualificationsLoading,
        error: qualificationsError,
        ensureQualification,
    } = useQualificationManagement();
    const { notify } = useNotification();

    const initialFormData = useMemo(() => createInitialFormData(initialData), [initialData]);
    const [formData, setFormData] = useState<EmployeeFormData>(initialFormData);
    const [selectedQualification, setSelectedQualification] = useState<string>("");
    const [newQualificationName, setNewQualificationName] = useState("");
    const [newQualificationError, setNewQualificationError] = useState<string | null>(null);
    const [isCreatingQualification, setIsCreatingQualification] = useState(false);
    const [touched, setTouched] = useState<Partial<Record<EmployeeFieldName, boolean>>>({});
    const [submitAttempted, setSubmitAttempted] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const pageRef = useRef<HTMLDivElement | null>(null);
    const formContentRef = useRef<HTMLDivElement | null>(null);
    const [formScale, setFormScale] = useState(1);

    useEffect(() => {
        setFormData(initialFormData);
        setTouched({});
        setSubmitAttempted(false);
        setSelectedQualification("");
        setNewQualificationName("");
        setNewQualificationError(null);
        setIsCreatingQualification(false);
    }, [initialFormData]);

    const recalculateFormScale = useCallback(() => {
        const pageElement = pageRef.current;
        const formContentElement = formContentRef.current;

        if (!pageElement || !formContentElement) {
            return;
        }

        const availableHeight = pageElement.clientHeight;
        const naturalFormHeight = formContentElement.offsetHeight;

        if (availableHeight <= 0 || naturalFormHeight <= 0) {
            return;
        }

        const nextScale = Math.min(1, Math.max(MIN_FORM_SCALE, availableHeight / naturalFormHeight));
        setFormScale((previous) => (Math.abs(previous - nextScale) < 0.01 ? previous : nextScale));
    }, []);

    useEffect(() => {
        recalculateFormScale();
    }, [
        recalculateFormScale,
        apiError,
        formData.qualifikationen.length,
        selectedQualification,
        newQualificationError,
        submitAttempted,
    ]);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        const handleResize = () => recalculateFormScale();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [recalculateFormScale]);

    useEffect(() => {
        if (typeof ResizeObserver === "undefined") {
            return;
        }

        const observer = new ResizeObserver(() => recalculateFormScale());
        if (pageRef.current) {
            observer.observe(pageRef.current);
        }
        if (formContentRef.current) {
            observer.observe(formContentRef.current);
        }

        return () => observer.disconnect();
    }, [recalculateFormScale]);

    const availableQualifications = useMemo(
        () => qualifications.map((qualification) => qualification.skill),
        [qualifications],
    );

    const selectableQualifications = useMemo(() => {
        const selected = new Set(formData.qualifikationen);
        return availableQualifications.filter((qualification) => !selected.has(qualification));
    }, [formData.qualifikationen, availableQualifications]);

    const formErrors = useMemo(() => validateForm(formData), [formData]);

    const isDirty = useMemo(() => {
        return (
            formData.vorname !== initialFormData.vorname ||
            formData.nachname !== initialFormData.nachname ||
            formData.telefonnummer !== initialFormData.telefonnummer ||
            formData.standort !== initialFormData.standort ||
            formData.street !== initialFormData.street ||
            formData.postcode !== initialFormData.postcode ||
            formData.qualifikationen.length !== initialFormData.qualifikationen.length ||
            formData.qualifikationen.some((qualification, index) => qualification !== initialFormData.qualifikationen[index])
        );
    }, [formData, initialFormData]);

    const hasValidationErrors = Object.keys(formErrors).length > 0;
    const isBusy = isSubmitting || isCreatingQualification;
    const effectiveSubmitLabel = submitLabel ?? (isEdit ? "Änderungen speichern" : "Mitarbeiter anlegen");
    const isCreateQualificationSelected = selectedQualification === CREATE_QUALIFICATION_OPTION;
    const canAddQualification =
        !isBusy &&
        selectedQualification !== "" &&
        (!isCreateQualificationSelected || newQualificationName.trim() !== "");

    const showFieldError = (field: EmployeeFieldName): boolean => {
        return Boolean(formErrors[field]) && (Boolean(touched[field]) || submitAttempted);
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        const fieldName = name as EmployeeFieldName;
        setFormData((previous) => ({
            ...previous,
            [fieldName]: value,
        }));
    };

    const markFieldTouched = (field: EmployeeFieldName) => {
        setTouched((previous) => ({
            ...previous,
            [field]: true,
        }));
    };

    const removeQualification = (qualification: string) => {
        setFormData((previous) => ({
            ...previous,
            qualifikationen: previous.qualifikationen.filter((entry) => entry !== qualification),
        }));
    };

    const addQualification = async () => {
        if (isBusy) return;

        if (selectedQualification && selectedQualification !== CREATE_QUALIFICATION_OPTION) {
            setFormData((previous) => ({
                ...previous,
                qualifikationen: previous.qualifikationen.some(
                    (qualification) => qualification.toLowerCase() === selectedQualification.toLowerCase(),
                )
                    ? previous.qualifikationen
                    : [...previous.qualifikationen, selectedQualification],
            }));
            setSelectedQualification("");
            setNewQualificationName("");
            setNewQualificationError(null);
            return;
        }

        const normalizedName = normalizeQualificationName(newQualificationName);
        if (!normalizedName) {
            setNewQualificationError("Bitte geben Sie eine Qualifikation ein.");
            return;
        }

        if (formData.qualifikationen.some((qualification) => qualification.toLowerCase() === normalizedName.toLowerCase())) {
            setNewQualificationError("Diese Qualifikation ist dem Mitarbeiter bereits zugewiesen.");
            return;
        }

        setIsCreatingQualification(true);
        setNewQualificationError(null);
        try {
            const result = await ensureQualification(normalizedName);

            if (!result.success) {
                setNewQualificationError(result.error);
                notify({
                    tone: "error",
                    title: "Qualifikation konnte nicht erstellt werden",
                    message: result.error,
                });
                return;
            }

            setFormData((previous) => ({
                ...previous,
                qualifikationen: previous.qualifikationen.some(
                    (qualification) => qualification.toLowerCase() === result.qualification.skill.toLowerCase(),
                )
                    ? previous.qualifikationen
                    : [...previous.qualifikationen, result.qualification.skill],
            }));
            setSelectedQualification("");
            setNewQualificationName("");
            setNewQualificationError(null);
            notify({
                tone: "success",
                title: result.created
                    ? "Qualifikation erstellt und hinzugefügt"
                    : "Vorhandene Qualifikation hinzugefügt",
                message: result.qualification.skill,
            });
        } finally {
            setIsCreatingQualification(false);
        }
    };

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        setSubmitAttempted(true);
        if (hasValidationErrors) return;
        onSubmit(formData);
    };

    const handleCancelClick = () => {
        if (isBusy) return;
        if (!isDirty) {
            navigate("/employees");
            return;
        }
        setShowCancelConfirm(true);
    };

    const confirmCancel = () => {
        setShowCancelConfirm(false);
        navigate("/employees");
    };

    return (
        <div
            className="employee-form-page"
            ref={pageRef}
        >
            <div className="employee-form-scale-shell">
                <div
                    className="employee-form-scale-content"
                    style={{ transform: `scale(${formScale})` }}
                >
                    <div className="employee-form-container" ref={formContentRef}>
                        <h1 className="page-title">{isEdit ? "Mitarbeiter bearbeiten" : "Mitarbeiter hinzufügen"}</h1>

                        <form onSubmit={handleSubmit} className="employee-form" noValidate>
                            {apiError && (
                                <div className="form-alert form-alert-error" role="alert">
                                    {apiError}
                                </div>
                            )}
                            {submitAttempted && hasValidationErrors && (
                                <div className="form-alert form-alert-error" role="alert">
                                    Bitte korrigieren Sie die markierten Felder.
                                </div>
                            )}

                            <div className="employee-form-sections">
                                <section className="card">
                                    <h2 className="card-title">Stammdaten</h2>

                                    <div className="grid-12">
                                        <div className="field span-4">
                                            <label htmlFor="vorname">Vorname</label>
                                            <input
                                                type="text"
                                                id="vorname"
                                                name="vorname"
                                                value={formData.vorname}
                                                onChange={handleInputChange}
                                                onBlur={() => markFieldTouched("vorname")}
                                                className={showFieldError("vorname") ? "input-invalid" : ""}
                                                required
                                                placeholder="Max Moritz"
                                            />
                                            {showFieldError("vorname") && <p className="field-error">{formErrors.vorname}</p>}
                                        </div>

                                        <div className="field span-4">
                                            <label htmlFor="nachname">Nachname</label>
                                            <input
                                                type="text"
                                                id="nachname"
                                                name="nachname"
                                                value={formData.nachname}
                                                onChange={handleInputChange}
                                                onBlur={() => markFieldTouched("nachname")}
                                                className={showFieldError("nachname") ? "input-invalid" : ""}
                                                required
                                                placeholder="Mustermann"
                                            />
                                            {showFieldError("nachname") && <p className="field-error">{formErrors.nachname}</p>}
                                        </div>

                                        <div className="field span-4">
                                            <label htmlFor="standort">Ort</label>
                                            <input
                                                type="text"
                                                id="standort"
                                                name="standort"
                                                value={formData.standort}
                                                onChange={handleInputChange}
                                                onBlur={() => markFieldTouched("standort")}
                                                className={showFieldError("standort") ? "input-invalid" : ""}
                                                required
                                                placeholder="Berlin"
                                            />
                                            {showFieldError("standort") && <p className="field-error">{formErrors.standort}</p>}
                                        </div>

                                        <div className="field span-8">
                                            <label htmlFor="street">Straße</label>
                                            <input
                                                type="text"
                                                id="street"
                                                name="street"
                                                value={formData.street}
                                                onChange={handleInputChange}
                                                onBlur={() => markFieldTouched("street")}
                                                className={showFieldError("street") ? "input-invalid" : ""}
                                                required
                                                placeholder="Musterstraße"
                                            />
                                            {showFieldError("street") && <p className="field-error">{formErrors.street}</p>}
                                        </div>

                                        <div className="field span-4">
                                            <label htmlFor="postcode">PLZ</label>
                                            <input
                                                type="text"
                                                id="postcode"
                                                name="postcode"
                                                value={formData.postcode}
                                                onChange={handleInputChange}
                                                onBlur={() => markFieldTouched("postcode")}
                                                className={showFieldError("postcode") ? "input-invalid" : ""}
                                                required
                                                maxLength={5}
                                                pattern="[0-9]{5}"
                                                placeholder="12345"
                                            />
                                            {showFieldError("postcode") && <p className="field-error">{formErrors.postcode}</p>}
                                        </div>

                                        <div className="field span-4">
                                            <label htmlFor="telefonnummer">Telefonnummer</label>
                                            <input
                                                type="tel"
                                                id="telefonnummer"
                                                name="telefonnummer"
                                                value={formData.telefonnummer}
                                                onChange={handleInputChange}
                                                onBlur={() => markFieldTouched("telefonnummer")}
                                                className={showFieldError("telefonnummer") ? "input-invalid" : ""}
                                                required
                                                placeholder="0123 456790"
                                            />
                                            {showFieldError("telefonnummer") && <p className="field-error">{formErrors.telefonnummer}</p>}
                                        </div>
                                    </div>
                                </section>

                                <section className="card">
                                    <h2 className="card-title">Qualifikationen</h2>

                                    <div className="subsection">
                                        <h3 className="subsection-title">Zugewiesene Qualifikationen</h3>
                                        {formData.qualifikationen.length === 0 ? (
                                            <p className="hint">Noch keine Qualifikationen zugewiesen.</p>
                                        ) : (
                                            <div className="chips">
                                                {formData.qualifikationen.map((qualification) => (
                                                    <div key={qualification} className="chip">
                                                        <span className="chip-text">{qualification}</span>
                                                        <button
                                                            type="button"
                                                            className="chip-remove"
                                                            onClick={() => removeQualification(qualification)}
                                                            aria-label={`Qualifikation entfernen: ${qualification}`}
                                                            title="Entfernen"
                                                            disabled={isBusy}
                                                        >
                                                            <FiTrash2 />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="subsection">
                                        <h3 className="subsection-title">Qualifikation hinzufügen</h3>
                                        <div className="field">
                                            <label htmlFor="qualificationSelect">Verfügbare Qualifikationen</label>

                                            {qualificationsError && (
                                                <p className="hint field-error">Fehler beim Laden der Qualifikationen: {qualificationsError}</p>
                                            )}

                                            <div className="add-row">
                                                <select
                                                    id="qualificationSelect"
                                                    className="select"
                                                    value={selectedQualification}
                                                    onChange={(event) => {
                                                        const value = event.target.value;
                                                        setSelectedQualification(value);
                                                        setNewQualificationError(null);
                                                        if (value !== CREATE_QUALIFICATION_OPTION) {
                                                            setNewQualificationName("");
                                                        }
                                                    }}
                                                    disabled={isBusy}
                                                >
                                                    <option value="">
                                                        {qualificationsLoading
                                                            ? "Lade Qualifikationen..."
                                                            : selectableQualifications.length === 0
                                                                ? "Keine Qualifikationen verfügbar - oder neue erstellen"
                                                                : "Wählen Sie eine Qualifikation aus"}
                                                    </option>
                                                    {selectableQualifications.map((qualification) => (
                                                        <option key={qualification} value={qualification}>
                                                            {qualification}
                                                        </option>
                                                    ))}
                                                    <option value={CREATE_QUALIFICATION_OPTION}>+ Neue Qualifikation erstellen</option>
                                                </select>

                                                <button
                                                    type="button"
                                                    className="btn-add"
                                                    onClick={addQualification}
                                                    disabled={!canAddQualification}
                                                >
                                                    <FiPlus /> {isCreatingQualification ? "Erstelle..." : "Hinzufügen"}
                                                </button>
                                            </div>

                                            {isCreateQualificationSelected && (
                                                <div className="add-inline-field">
                                                    <label htmlFor="newQualificationInput">Neue Qualifikation</label>
                                                    <input
                                                        type="text"
                                                        id="newQualificationInput"
                                                        name="newQualificationInput"
                                                        value={newQualificationName}
                                                        onChange={(event) => setNewQualificationName(event.target.value)}
                                                        placeholder="z.B. Kotlin"
                                                        disabled={isBusy}
                                                    />
                                                    {newQualificationError && <p className="field-error">{newQualificationError}</p>}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </section>
                            </div>

                            <div className="actions">
                                <button type="button" className="btn-secondary" onClick={handleCancelClick} disabled={isBusy}>
                                    Abbrechen
                                </button>
                                <button type="submit" className="btn-primary" disabled={isBusy}>
                                    {isSubmitting ? "Speichern..." : effectiveSubmitLabel}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <CustomModal
                show={showCancelConfirm}
                onClose={() => setShowCancelConfirm(false)}
                onSave={confirmCancel}
                title="Änderungen verwerfen?"
                saveButtonText="Verwerfen"
                cancelButtonText="Weiter bearbeiten"
                saveVariant="danger"
            >
                <p>Sie haben ungespeicherte Änderungen. Möchten Sie diese wirklich verwerfen?</p>
            </CustomModal>
        </div>
    );
}
