import { Router } from 'express';
import { storage } from './storage.js';
import { 
  insertOrganizationSchema, 
  insertUserSchema, 
  insertCourseSchema, 
  insertEnrollmentSchema 
} from '../shared/schema.js';

const router = Router();

// Organizations routes
router.get('/organizations', async (req, res) => {
  try {
    const organizations = await storage.getOrganizations();
    res.json(organizations);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({ error: 'Failed to fetch organizations' });
  }
});

router.post('/organizations', async (req, res) => {
  try {
    const data = insertOrganizationSchema.parse(req.body);
    const organization = await storage.createOrganization(data);
    res.status(201).json(organization);
  } catch (error) {
    console.error('Error creating organization:', error);
    res.status(400).json({ error: 'Failed to create organization' });
  }
});

router.put('/organizations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = insertOrganizationSchema.partial().parse(req.body);
    const organization = await storage.updateOrganization(id, data);
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    res.json(organization);
  } catch (error) {
    console.error('Error updating organization:', error);
    res.status(400).json({ error: 'Failed to update organization' });
  }
});

router.delete('/organizations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await storage.deleteOrganization(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting organization:', error);
    res.status(500).json({ error: 'Failed to delete organization' });
  }
});

// Users routes
router.get('/users', async (req, res) => {
  try {
    const { role, organizationId } = req.query;
    
    let users;
    if (role) {
      users = await storage.getUsersByRole(role as string);
    } else if (organizationId) {
      users = await storage.getUsersByOrganization(organizationId as string);
    } else {
      users = await storage.getUsers();
    }
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.post('/users', async (req, res) => {
  try {
    const data = insertUserSchema.parse(req.body);
    const user = await storage.createUser(data);
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(400).json({ error: 'Failed to create user' });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = insertUserSchema.partial().parse(req.body);
    const user = await storage.updateUser(id, data);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(400).json({ error: 'Failed to update user' });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await storage.deleteUser(id);
    if (!deleted) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Courses routes
router.get('/courses', async (req, res) => {
  try {
    const { organizationId } = req.query;
    
    let courses;
    if (organizationId) {
      courses = await storage.getCoursesByOrganization(organizationId as string);
    } else {
      courses = await storage.getCourses();
    }
    
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

router.post('/courses', async (req, res) => {
  try {
    const data = insertCourseSchema.parse(req.body);
    const course = await storage.createCourse(data);
    res.status(201).json(course);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(400).json({ error: 'Failed to create course' });
  }
});

router.put('/courses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = insertCourseSchema.partial().parse(req.body);
    const course = await storage.updateCourse(id, data);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(400).json({ error: 'Failed to update course' });
  }
});

router.delete('/courses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await storage.deleteCourse(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

// Enrollments routes
router.get('/enrollments', async (req, res) => {
  try {
    const { courseId } = req.query;
    
    let enrollments;
    if (courseId) {
      enrollments = await storage.getEnrollmentsByCourse(courseId as string);
    } else {
      enrollments = await storage.getEnrollments();
    }
    
    res.json(enrollments);
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    res.status(500).json({ error: 'Failed to fetch enrollments' });
  }
});

router.post('/enrollments', async (req, res) => {
  try {
    const data = insertEnrollmentSchema.parse(req.body);
    const enrollment = await storage.createEnrollment(data);
    res.status(201).json(enrollment);
  } catch (error) {
    console.error('Error creating enrollment:', error);
    res.status(400).json({ error: 'Failed to create enrollment' });
  }
});

router.put('/enrollments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = insertEnrollmentSchema.partial().parse(req.body);
    const enrollment = await storage.updateEnrollment(id, data);
    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }
    res.json(enrollment);
  } catch (error) {
    console.error('Error updating enrollment:', error);
    res.status(400).json({ error: 'Failed to update enrollment' });
  }
});

router.delete('/enrollments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await storage.deleteEnrollment(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting enrollment:', error);
    res.status(500).json({ error: 'Failed to delete enrollment' });
  }
});

export default router;