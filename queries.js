

// use process.env variables to keep private variables,
require('dotenv').config()
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
    pool.query(`SELECT * FROM ${orders_table}`, (error, results) => {
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
    const order_id = parseInt(request.params.id);
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

const postReport = (request, response) => {
    console.log("CREATE_REPORT");
    console.log(request.body);
    var items = request.body
    
    var values = []
    if(!items.length)
    {
        console.log('Assuming one item')
        items = [request.body]
    }
    
    for(i = 0; i < items.length; i++)
    {
        var item = items[i];
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
                RETURNING *`;

    const query2 = pg_format(query, values)
    console.log(query2);

    pool.query(query2, (error, results) => {
        if(error){
            console.error(error);
            response.status(500).json(error);
        }
        else
        {
            response.status(201).json(results.rows);
        }
    })
}

const postReport2 = (request, response) => {
    console.log("CREATE_REPORT2");
    console.log(request.body);
    var items = request.body
    
    var values = []
    var ids = []
    if(!items.length)
    {
        console.log('Assuming one item')
        items = [request.body]
    }
    
    for(i = 0; i < items.length; i++)
    {
        var item = items[i];
        values.push([
            item.order_id,
            item.order_name,
            item.on_or_off,
            item.switch_status,
            item.radio_selection,
            item.spinner_selection
        ]);
        ids.push(item.id);
    }

    var query = `
                INSERT INTO ${orders_table} 
                (order_id, order_name, on_or_off, switch_status, radio_selection, spinner_selection)
                VALUES
                %L
                RETURNING *`;

    const query2 = pg_format(query, values)
    console.log(query2);

    pool.query(query2, (error, results) => {
        if(error){
            console.error(error);
            response.status(500).json(error);
        }
        else
        {
            response.status(201).json(ids);
        }
    })
}

const putReport = (request, response) => {
    console.log('PUT_REPORT');
    console.log(request.body);

    var query = `UPDATE ${orders_table} 
                    SET order_id = $2,
                        order_name = $3,
                        on_or_off = $4,
                        switch_status = $5,
                        radio_selection = $6,
                        spinner_selection = $7
                WHERE id = $1
                RETURNING *`;

    const b = request.body;
    const args = [b.id, b.order_id, b.order_name, b.on_or_off, b.switch_status, b.radio_selection, b.spinner_selection];

    pool.query(query, args, (error, results) =>{
        if(error){
            console.error(error)
            response.status(400).json(error)
        }
        else{
            response.json(results.rows)
        }
    })
}

const deleteReport = (request, response) => {
    console.log("DELETE_REPORT");
    console.log(request.body);
    const id = parseInt(request.body.id);

    var query = `DELETE FROM ${orders_table}
                 WHERE id = $1`
    pool.query(query, [id], (error, results) => {
        if(error){
            console.error(err);
            response.status(400).json({dbError: 'failed delete'})
        }
        else{
            response.json({delete: 'true'})
        }
    })
}

module.exports = {
    getReports,
    getReportByOrderId,
    postReport,
    postReport2,
    putReport,
    deleteReport
}