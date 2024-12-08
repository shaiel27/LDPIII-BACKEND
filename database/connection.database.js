import 'dotenv/config'
import pg from 'pg'

const connectionString = process.env.DATABASE_URL
 
const {Pool}=pg

export const db=new Pool({
    allowExitOnIdle:true,
    connectionString,
})
const initDatabase = async () => {
    try {
      await db.query('SELECT NOW()')
      console.log('DATABASE connected')
    } catch (error) {
      console.error('Database connection error:', error)
    }
  }
  
  initDatabase()