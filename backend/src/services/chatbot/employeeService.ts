import { FunctionDeclaration, SchemaType } from '@google/generative-ai';
import User, { IUser } from '../../models/User';
import Task from '../../models/Task';

// AI Bot ke liye 'getEmployeeWorkload' tool ka JSON schema.
// Isse Gemini ko pata chalega ki ye function kya karta hai aur ise kya data chahiye.
export const getEmployeeWorkloadDeclaration: FunctionDeclaration = {
  name: 'getEmployeeWorkload',
  description: 'Evaluates the workload of an employee. Returns the count of pending and completed tasks. ADMIN ONLY.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      employeeName: { type: SchemaType.STRING, description: 'First or full name of the employee to evaluate' }
    },
    required: ['employeeName']
  },
};

// Asli function jo tab chalega jab AI 'getEmployeeWorkload' use karne ko bolega
export async function handleGetEmployeeWorkload(user: IUser, args: { employeeName: string }) {
  // 1. Security: Sirf admin ko hi doosre employees ka workload dekhne ki ijazat hai
  if (user.role !== 'admin') {
    return { error: 'UNAUTHORIZED: Only administrators can view employee workloads.' };
  }

  // 2. Database me us naam ke employee ko dhoondhna (case-insensitive)
  const employee = await User.findOne({ name: { $regex: new RegExp(args.employeeName, 'i') } });
  if (!employee) {
    return { error: `Employee '${args.employeeName}' not found.` };
  }

  // 3. Employee ke pending, completed, aur high priority tasks ki ginti (count) nikalna
  const pendingTasks = await Task.countDocuments({ assignedTo: employee._id, status: { $nin: ['completed', 'cancelled'] } });
  const completedTasks = await Task.countDocuments({ assignedTo: employee._id, status: 'completed' });
  const highPriority = await Task.countDocuments({ assignedTo: employee._id, priority: 'high', status: { $nin: ['completed', 'cancelled'] } });

  return {
    success: true,
    data: {
      employee: employee.name,
      designation: employee.designation,
      pendingTasks,
      completedTasks,
      highPriorityPending: highPriority,
      workloadStatus: pendingTasks > 5 ? 'overloaded' : (pendingTasks > 2 ? 'busy' : 'available')
    }
  };
}
