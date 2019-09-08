
const orders_table = 'invscanner_db.orders'
const Pool = require('pg').Pool
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'invscanner',
    password: 'Saintpaul1!',
    port: 5432
})

const getReports = (request, response) => {
    pool.query(`SELECT * FROM ${orders_table} ORDER BY partreportid ASC`, (error, results) => {
        if(error){
            response.status(500).json(error);
        }
        response.status(200).json(results.rows);
    });
}

const getReportById = (request, response) => {
    const id = parseInt(request.params.id);
    var q = pool.query(`SELECT * FROM ${orders_table} WHERE partreportid = $1`, [id], (error,results) =>{
        if(error){
            response.status(500).json(error);
        }
        response.status(200).json(results.rows);
    });
}

const createReport = (request, response) => {
    const {order_id, order_name, on_or_off, switch_status, radio_selection, spinner_selection} = request.body;

    var query = `
                INSERT INTO ${orders_table} 
                (order_id, order_name, on_or_off, switch_status, radio_selection, spinner_selection)
                VALUES
                ($1, $2, $3, $4, $5, $6)
                RETURNING *
                `;
    pool.query(query, [order_id, order_name, on_or_off, switch_status, radio_selection, spinner_selection],(error, results) => {
        if(error){
            response.status(500).json(error);
        }
        response.status(201).json(results.rows);
    })


}

module.exports = {
    getReports,
    getReportById,
    createReport
}