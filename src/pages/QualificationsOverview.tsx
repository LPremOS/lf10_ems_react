import { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { useNavigate } from "react-router-dom"
import { useDebounce } from "../hooks/useDebounce";
import { useQualifiactionApi } from "../hooks/useQualificationApi";
import { Loader } from "../components/common/Loader";

export function QualificationsOverview() {
    const navigate = useNavigate();
    const {fetchQualifications, loading, error} = useQualifiactionApi();
    const [qualifications, setQualifications] = useState<any[]>([]);
    const [searchInput, setSearchInput] = useState("");
    const debouncedSearchInput = useDebounce(searchInput, 300);
    const handleDelete = (id : string) => {
        console.log(id);
    }

    useEffect(() => {
        const loadQualifications = async () => {
            const data = await fetchQualifications();
            if (Array.isArray(data)) {
                setQualifications(data);
                console.log("Data:" + data);
            }
        };
        loadQualifications();
    }, [fetchQualifications]);
    console.log("Qualifications:" + qualifications);

    const filteredQualifications = qualifications.filter(q => 
        q.skill.toLocaleLowerCase().includes(debouncedSearchInput.toLowerCase())
    );

    if (loading) return <Loader />;
    if (error) return <p className="text-danger">Fehler: {error}</p>;

    return(
        <>
            <div className="employee-overview">
                <div className="employee-header">
                    <h1>Qualifikationsübersicht</h1>
                    <button
                    className="btn-new-employee"
                    onClick={() => navigate('/qualifications/add')}
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
                                            onClick={() => navigate(`/qualifications/edit/${q.id}`)}
                                            title="Qualifikation bearbeiten"
                                        >
                                            <AiOutlineEdit />
                                        </button>
                                        <button 
                                            className="btn btn-link text-danger p-1"
                                            onClick={() => handleDelete(q.id)}
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
        </>
    )
}