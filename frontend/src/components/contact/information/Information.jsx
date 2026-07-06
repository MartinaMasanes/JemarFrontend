import CustomCard from "../../card/CustomCard";

const Information = () => {
    return (
        <>
            <div className="d-flex justify-content-center align-items-center flex-column fw-bold">
                <CustomCard title="CONTACTO">
                    <label>
                        <div>Dirección: Dorrego 453, Rosario, Santa Fe.</div>
                        <div>Teléfono: +54 123 4567890</div>
                        <div>Celular: +54 098 7654321</div>
                        <div>Correo Electrónico: contacto@jemar.com.ar</div>
                    </label>
                    <div className="mt-3 align-items-center">
                        <iframe
                            title="Ubicación en Google Maps"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3360.4713068456353!2d-60.64983522442693!3d-32.94941347280553!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95b6539c8a48ad55%3A0xc780bd32769b8a12!2sDorrego%20453%2C%20Rosario%2C%20Santa%20Fe!5e0!3m2!1ses!2sar!4v1693685189056!5m2!1ses!2sar"
                            className="map-container"
                        ></iframe>
                    </div>
                </CustomCard>
            </div>
        </>
    );
};

export default Information;
