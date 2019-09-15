
const orders_table = 'invscanner_db.partreports'
const Pool = require('pg').Pool
const pg_format = require('pg-format');
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'invscanner',
    password: 'Saintpaul1!',
    port: 5432
})



const getReports = (request, response) => {
    console.log(request.url);
    pool.query(`SELECT * FROM ${orders_table} ORDER BY partreportid ASC`, (error, results) => {
        if(error){
            console.error(error);
            response.status(500).json(error);
        }
        else
        {
            response.status(200).json(results.rows);
        }
    });
}

const getReportByOrderId = (request, response) => {
    console.log(request.url);
    const id = parseInt(request.params.id);
    var q = pool.query(`SELECT * FROM ${orders_table} WHERE order_id = $1`, [id], (error,results) =>{
        if(error){
            console.error(error);
            response.status(500).json(error);
        }
        else
        {
            response.status(200).json(results.rows);
        }
    });
}

const createReport = (request, response) => {
    console.log("CREATE_REPORT")
    console.log(request.body);
    
    var values = []
    for(i = 0; i < request.body.length; i++)
    {
        var item = request.body[i];
        values.push([
            item.order_id,
            item.order_name,
            item.on_or_off,
            item.switch_status,
            item.radio_selection,
            item.spinner_selection
        ]);
    }

    var query = `
                INSERT INTO ${orders_table} 
                (order_id, order_name, on_or_off, switch_status, radio_selection, spinner_selection)
                VALUES
                %L
                RETURNING *
                `;

    const query2 = pg_format(query, values)

    pool.query(query2, (error, results) => {
        if(error){
            console.error(error);
            response.status(500).json(error);
        }
        else
        {
            response.status(201).json(results.rows[0]);
        }
    })


}

module.exports = {
    getReports,
    getReportByOrderId,
    createReport
}