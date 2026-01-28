
import { Col, Row } from "react-bootstrap";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { useDebounce } from "../hooks/useDebounce";
import { Loader } from "../components/common/Loader";
import { useQualificationManagement } from "../hooks/useQualificationManagement";
import { CustomModal } from "../components/common/Modal";
import { InputField } from "../components/common/InputField";
import { useState } from "react";

export function QualificationsOverview() {
    const [searchInput, setSearchInput] = useState("");
    const debouncedSearchInput = useDebounce(searchInput, 300);

    const {
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
    } = useQualificationManagement();

    const filteredQualifications = qualifications.filter(q => 
        q.skill.toLowerCase().includes(debouncedSearchInput.toLowerCase())
    );

    const renderModalContent = () => {
        if (modalMode === 'delete' && selectedQualification) {
            return (
                <p>
                    Möchten Sie die Qualifikation <strong>{selectedQualification?.skill}</strong> wirklich löschen?
                </p>
            );
        }
        return (
            <>
                <InputField
                    type="text"
                    id="skillInput"
                    label="Qualifikationsname"
                    placeholder="z.B. Java Developer"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                />
            </>
        );
    };



    if (loading) return <Loader />;
    if (error) return <p className="text-danger">Fehler: {error}</p>;

    return(
        <>
            <div className="employee-overview">
                <div className="employee-header">
                    <h1>Qualifikationsübersicht</h1>
                    <button
                    className="btn-new-employee"
                    onClick={openAddModal}
                    >
                    Neue Qualifikation anlegen
                    </button>
                </div>
                <div className="filter-section">
                    <h3>Filter</h3>
                    <div className="position-relative">
                        <i className="bi bi-search position-absolute" 
                        style={{ left: '10px', top: '50%', transform: 'translateY(15%)', color: '#6c757d' }}></i>
                        <div className="filter-group">
                            <label>Bezeichnung</label>
                            <input
                                type="text"
                                placeholder="Suche nach Bezeichnung..."
                                style={{ paddingLeft: '35px' }}
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="filter-section">
                    <h3>Verfügbare Qualifikationen</h3>
                    <Row>
                        <Col xs={10}>
                            <h6>Bezeichnung der Qualifikation</h6>
                        </Col>
                        <Col xs={2} className="text-end">
                            <h6>Aktionen</h6>
                        </Col>
                    </Row>
                    <div className="qualificationList">
                        {filteredQualifications.length > 0 ? (
                            filteredQualifications.map((q) => (
                                <Row key={q.id} className="py-2 border-bottom">
                                    <Col xs={10}>
                                        <div>
                                            <p className="fw-normal">{q.skill}</p>
                                        </div>
                                    </Col>
                                    <Col xs={2} className="text-end">
                                        <button 
                                            className="btn btn-link text-black-50 p-1"
                                            onClick={() => openEditModal(q)}
                                            title="Qualifikation bearbeiten"
                                        >
                                            <AiOutlineEdit />
                                        </button>
                                        <button 
                                            className="btn btn-link text-danger p-1"
                                            onClick={() => openDeleteModal(q)}
                                            title="Qualifikation löschen"
                                        >
                                            <AiOutlineDelete />
                                        </button>
                                    </Col>
                                </Row>
                            ))
                        ) : (
                            <p className="text-muted">Keine Qualifikationen gefunden.</p>
                        )}
                    </div>
                </div>
            </div>

            <CustomModal
                show={showModal}
                onClose={closeModal}
                onSave={saveQualification}
                title={getModalTitle()}
                saveButtonText={getModalSaveText()}
                children={renderModalContent()}           
            />
        </>
    )
}