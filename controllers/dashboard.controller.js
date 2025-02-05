import { db } from "../database/connection.database"

class DashboardModel {
  static async getDashboardStats() {
    try {
      const workersQuery = "SELECT COUNT(*) FROM worker"
      const petsQuery = "SELECT COUNT(*) FROM pet"
      const appointmentsQuery = "SELECT COUNT(*), status FROM appointment GROUP BY status"
      const inventoryQuery =
        "SELECT COUNT(*), SUM(CASE WHEN quantity < 10 THEN 1 ELSE 0 END) as low_stock FROM inventory"

      const [workers, pets, appointments, inventory] = await Promise.all([
        db.query(workersQuery),
        db.query(petsQuery),
        db.query(appointmentsQuery),
        db.query(inventoryQuery),
      ])

      return {
        totalWorkers: workers.rows[0].count,
        totalPets: pets.rows[0].count,
        appointments: appointments.rows,
        inventory: inventory.rows[0],
      }
    } catch (error) {
      console.error("Error in getDashboardStats:", error)
      throw error
    }
  }

  static async getAppointmentsStats(startDate, endDate) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'Confirmada' THEN 1 ELSE 0 END) as confirmed,
          SUM(CASE WHEN status = 'En Proceso' THEN 1 ELSE 0 END) as in_process,
          SUM(CASE WHEN status = 'Pendiente' THEN 1 ELSE 0 END) as pending,
          DATE(date_request) as date
        FROM appointment
        WHERE date_request BETWEEN $1 AND $2
        GROUP BY DATE(date_request)
        ORDER BY date
      `
      const { rows } = await db.query(query, [startDate, endDate])
      return rows
    } catch (error) {
      console.error("Error in getAppointmentsStats:", error)
      throw error
    }
  }
}

export { DashboardModel }

