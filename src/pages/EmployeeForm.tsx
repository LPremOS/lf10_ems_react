import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { CustomModal } from "../components/common/Modal";
import { useQualificationManagement } from "../hooks/useQualificationManagement";
import { useNotification } from "../components/common/NotificationProvider";
import { EMPLOYEE_ROUTES } from "../features/employees/routes";
import {
    type EmployeeFormData,
    type EmployeeFormFieldName,
    areEmployeeFormDataEqual,
    createEmployeeFormData,
    validateEmployeeForm,
} from "../features/employees/formModel";
import "./EmployeeForm.css";

export type { EmployeeFormData } from "../features/employees/formModel";
type EmployeeFieldName = EmployeeFormFieldName;

// Props fuer die gemeinsame Formular-Komponente (create + edit).
interface EmployeeFormProps {
    initialData?: EmployeeFormData | null;
    onSubmit: (data: EmployeeFormData) => void;
    isEdit?: boolean;
    isSubmitting?: boolean;
    apiError?: string | null;
    submitLabel?: string;
}

// Spezieller Select-Wert fuer "neue Qualifikation anlegen".
const CREATE_QUALIFICATION_OPTION = "__create_new__";
// Untergrenze der UI-Skalierung, damit der Inhalt lesbar bleibt.
const MIN_FORM_SCALE = 0.78;

function normalizeQualificationName(value: string): string {
    // Konsistente Normalisierung fuer Duplikatpruefungen.
    return value.trim();
}

function getQualificationOptionLabel(skill: string): string {
    // Lange Skillnamen werden in der Select-UI abgekuerzt.
    const trimmedSkill = skill.trim();
    if (trimmedSkill.length <= 40) {
        return trimmedSkill;
    }
    return `${trimmedSkill.slice(0, 37)}...`;
}

// Gemeinsames Formular fuer "Mitarbeiter anlegen" und "Mitarbeiter bearbeiten".
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

    // Ausgangsdaten fuer das Formular (bei Edit aus initialData, sonst leer).
    const initialFormData = useMemo(() => createEmployeeFormData(initialData), [initialData]);
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
        // Bei Wechsel der Initialdaten wird das Formular komplett resetet.
        setFormData(initialFormData);
        setTouched({});
        setSubmitAttempted(false);
        setSelectedQualification("");
        setNewQualificationName("");
        setNewQualificationError(null);
        setIsCreatingQualification(false);
    }, [initialFormData]);

    const recalculateFormScale = useCallback(() => {
        // Dynamische Skalierung, damit das Formular vertikal in den Viewport passt.
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
        // Re-Scale bei inhaltlichen Aenderungen (z.B. Fehlerbox, neue Qualifikationen).
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

        // Re-Scale beim Fenster-Resize.
        const handleResize = () => recalculateFormScale();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [recalculateFormScale]);

    useEffect(() => {
        if (typeof ResizeObserver === "undefined") {
            return;
        }

        // Beobachtet Groessenaenderungen ohne manuelle Trigger.
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
        // Nur Skillnamen fuer das Select benoetigt.
        () => qualifications.map((qualification) => qualification.skill),
        [qualifications],
    );

    const selectableQualifications = useMemo(() => {
        // Bereits zugewiesene Skills sollen im Dropdown nicht nochmal angeboten werden.
        const selected = new Set(formData.qualifikationen);
        return availableQualifications.filter((qualification) => !selected.has(qualification));
    }, [formData.qualifikationen, availableQualifications]);

    // Feldvalidierung und Dirty-Check als berechnete Werte.
    const formErrors = useMemo(() => validateEmployeeForm(formData), [formData]);
    const isDirty = useMemo(() => !areEmployeeFormDataEqual(formData, initialFormData), [formData, initialFormData]);

    const hasValidationErrors = Object.keys(formErrors).length > 0;
    const isBusy = isSubmitting || isCreatingQualification;
    const effectiveSubmitLabel = submitLabel ?? (isEdit ? "Änderungen speichern" : "Mitarbeiter anlegen");
    const isCreateQualificationSelected = selectedQualification === CREATE_QUALIFICATION_OPTION;
    const canAddQualification =
        !isBusy &&
        selectedQualification !== "" &&
        (!isCreateQualificationSelected || newQualificationName.trim() !== "");

    const showFieldError = (field: EmployeeFieldName): boolean => {
        // Fehler erst nach Touch oder Submit anzeigen -> ruhigeres UX-Verhalten.
        return Boolean(formErrors[field]) && (Boolean(touched[field]) || submitAttempted);
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        // Allgemeiner Input-Handler fuer alle Textfelder.
        const { name, value } = event.target;
        const fieldName = name as EmployeeFieldName;
        setFormData((previous) => ({
            ...previous,
            [fieldName]: value,
        }));
    };

    const markFieldTouched = (field: EmployeeFieldName) => {
        // Markiert ein Feld als "interagiert" fuer die Fehleranzeige.
        setTouched((previous) => ({
            ...previous,
            [field]: true,
        }));
    };

    const removeQualification = (qualification: string) => {
        // Entfernt ein Skill-Badge aus der aktuellen Zuordnung.
        setFormData((previous) => ({
            ...previous,
            qualifikationen: previous.qualifikationen.filter((entry) => entry !== qualification),
        }));
    };

    const addQualification = async () => {
        // Nichts starten, wenn bereits gespeichert/erstellt wird.
        if (isBusy) return;

        if (selectedQualification && selectedQualification !== CREATE_QUALIFICATION_OPTION) {
            // Vorhandene Qualifikation direkt zuweisen (mit Duplikat-Schutz).
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

        // Neue Qualifikation ggf. im Backend erzeugen und danach zuweisen.
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
        // Frontend-Validierung vor dem eigentlichen Submit.
        event.preventDefault();
        setSubmitAttempted(true);
        if (hasValidationErrors) return;
        onSubmit(formData);
    };

    const handleCancelClick = () => {
        // Bei geaenderten Daten wird ein Bestaetigungsdialog angezeigt.
        if (isBusy) return;
        if (!isDirty) {
            navigate(EMPLOYEE_ROUTES.overview);
            return;
        }
        setShowCancelConfirm(true);
    };

    const confirmCancel = () => {
        // Verwirft Aenderungen und geht zur Uebersicht zurueck.
        setShowCancelConfirm(false);
        navigate(EMPLOYEE_ROUTES.overview);
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

                                        <div className="field span-6">
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

                                        <div className="field span-3">
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

                                        <div className="field span-3">
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
                                                                ? "Keine Qualifikationen verfügbar"
                                                                : "Wählen Sie eine Qualifikation aus"}
                                                    </option>
                                                    {selectableQualifications.map((qualification) => (
                                                        <option
                                                            key={qualification}
                                                            value={qualification}
                                                            title={qualification}
                                                        >
                                                            {getQualificationOptionLabel(qualification)}
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
