import requests
import sys
import json
from datetime import datetime
import time

class TeacherGradingAPITester:
    def __init__(self, base_url="https://project-inquiry-1.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.created_ids = {
            'students': [],
            'subjects': [],
            'learning_objectives': [],
            'subject_class_objectives': []
        }

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}" if not endpoint.startswith('http') else endpoint
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, dict) and 'id' in response_data:
                        print(f"   Created ID: {response_data['id']}")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        success, response = self.run_test("Root API", "GET", "", 200)
        return success

    def test_student_management(self):
        """Test all student management endpoints"""
        print("\n" + "="*50)
        print("TESTING STUDENT MANAGEMENT")
        print("="*50)
        
        # Generate unique identifiers
        timestamp = str(int(time.time()))
        
        # Test create student
        student_data = {
            "nama": f"Test Student {timestamp}",
            "nis": f"TEST{timestamp}",
            "kelas": "X1",
            "jenis_kelamin": "Laki-laki",
            "status": "Aktif"
        }
        success, response = self.run_test("Create Student", "POST", "students", 200, student_data)
        if success and 'id' in response:
            self.created_ids['students'].append(response['id'])
            student_id = response['id']
        else:
            return False

        # Test create another student for class filtering
        student_data2 = {
            "nama": f"Test Student 2 {timestamp}",
            "nis": f"TEST2{timestamp}", 
            "kelas": "X2",
            "jenis_kelamin": "Perempuan",
            "status": "Aktif"
        }
        success, response = self.run_test("Create Student 2", "POST", "students", 200, student_data2)
        if success and 'id' in response:
            self.created_ids['students'].append(response['id'])

        # Test duplicate NIS prevention
        success, _ = self.run_test("Duplicate NIS Prevention", "POST", "students", 400, student_data)

        # Test get all students
        success, _ = self.run_test("Get All Students", "GET", "students", 200)

        # Test get students with search
        success, _ = self.run_test("Search Students", "GET", "students", 200, params={"search": "Test"})

        # Test get students by class
        success, _ = self.run_test("Filter Students by Class", "GET", "students", 200, params={"kelas": "X1"})

        # Test get single student
        success, _ = self.run_test("Get Single Student", "GET", f"students/{student_id}", 200)

        # Test update student
        update_data = {"nama": "Updated Test Student"}
        success, _ = self.run_test("Update Student", "PUT", f"students/{student_id}", 200, update_data)

        # Test get classes list
        success, _ = self.run_test("Get Classes List", "GET", "students/classes/list", 200)

        return True

    def test_subject_management(self):
        """Test subject and learning objective management"""
        print("\n" + "="*50)
        print("TESTING SUBJECT MANAGEMENT")
        print("="*50)

        # Generate unique identifiers
        timestamp = str(int(time.time()))

        # Test create subject
        subject_data = {"nama_mata_pelajaran": f"Matematika {timestamp}"}
        success, response = self.run_test("Create Subject", "POST", "subjects", 200, subject_data)
        if success and 'id' in response:
            self.created_ids['subjects'].append(response['id'])
            subject_id = response['id']
        else:
            return False

        # Test duplicate subject prevention
        success, _ = self.run_test("Duplicate Subject Prevention", "POST", "subjects", 400, subject_data)

        # Test get all subjects
        success, _ = self.run_test("Get All Subjects", "GET", "subjects", 200)

        # Test update subject
        update_data = {"nama_mata_pelajaran": f"Matematika Lanjutan {timestamp}"}
        success, _ = self.run_test("Update Subject", "PUT", f"subjects/{subject_id}", 200, update_data)

        # Test create learning objective
        objective_data = {"tujuan_pembelajaran": f"Memahami konsep dasar aljabar {timestamp}"}
        success, response = self.run_test("Create Learning Objective", "POST", "learning-objectives", 200, objective_data)
        if success and 'id' in response:
            self.created_ids['learning_objectives'].append(response['id'])
            objective_id = response['id']
        else:
            return False

        # Test create another learning objective
        objective_data2 = {"tujuan_pembelajaran": f"Menyelesaikan persamaan linear {timestamp}"}
        success, response = self.run_test("Create Learning Objective 2", "POST", "learning-objectives", 200, objective_data2)
        if success and 'id' in response:
            self.created_ids['learning_objectives'].append(response['id'])

        # Test get all learning objectives
        success, _ = self.run_test("Get All Learning Objectives", "GET", "learning-objectives", 200)

        # Test update learning objective
        update_data = {"tujuan_pembelajaran": "Memahami konsep dasar aljabar dan geometri"}
        success, _ = self.run_test("Update Learning Objective", "PUT", f"learning-objectives/{objective_id}", 200, update_data)

        return True

    def test_subject_class_objectives(self):
        """Test subject-class-objective configurations"""
        print("\n" + "="*50)
        print("TESTING SUBJECT-CLASS-OBJECTIVE CONFIGURATIONS")
        print("="*50)

        if not self.created_ids['subjects'] or not self.created_ids['learning_objectives']:
            print("❌ Cannot test - missing subjects or learning objectives")
            return False

        # Test create subject-class-objective configuration
        sco_data = {
            "subject_id": self.created_ids['subjects'][0],
            "kelas": "X1",
            "learning_objective_ids": self.created_ids['learning_objectives']
        }
        success, response = self.run_test("Create Subject-Class-Objective", "POST", "subject-class-objectives", 200, sco_data)
        if success and 'id' in response:
            self.created_ids['subject_class_objectives'].append(response['id'])
            sco_id = response['id']
        else:
            return False

        # Test duplicate configuration prevention
        success, _ = self.run_test("Duplicate Configuration Prevention", "POST", "subject-class-objectives", 400, sco_data)

        # Test get all configurations
        success, _ = self.run_test("Get All Configurations", "GET", "subject-class-objectives", 200)

        return True

    def test_grade_management(self):
        """Test grade input and management"""
        print("\n" + "="*50)
        print("TESTING GRADE MANAGEMENT")
        print("="*50)

        if not all([self.created_ids['students'], self.created_ids['subjects'], self.created_ids['learning_objectives']]):
            print("❌ Cannot test - missing required data")
            return False

        # Test get objectives by subject and class
        subject_id = self.created_ids['subjects'][0]
        success, _ = self.run_test("Get Objectives by Subject-Class", "GET", f"grades/objectives/{subject_id}/X1", 200)

        # Test get grades by criteria
        objective_id = self.created_ids['learning_objectives'][0]
        success, _ = self.run_test("Get Grades by Criteria", "GET", f"grades/{subject_id}/X1/{objective_id}", 200)

        # Test create grade
        grade_data = {
            "student_id": self.created_ids['students'][0],
            "subject_id": subject_id,
            "kelas": "X1",
            "learning_objective_id": objective_id,
            "nilai": 85.5
        }
        success, _ = self.run_test("Create Grade", "POST", "grades", 200, grade_data)

        # Test update existing grade (should update, not create new)
        grade_data["nilai"] = 90.0
        success, _ = self.run_test("Update Existing Grade", "POST", "grades", 200, grade_data)

        return True

    def test_reports(self):
        """Test report generation"""
        print("\n" + "="*50)
        print("TESTING REPORTS")
        print("="*50)

        # Test get class grade report
        success, _ = self.run_test("Get Class Grade Report", "GET", "reports/grades/X1", 200)

        return True

    def test_excel_operations(self):
        """Test Excel template and export operations"""
        print("\n" + "="*50)
        print("TESTING EXCEL OPERATIONS")
        print("="*50)

        # Test download student template
        success, _ = self.run_test("Download Student Template", "GET", "students/template/download", 200)

        # Test export class grades
        success, _ = self.run_test("Export Class Grades", "GET", "reports/grades/X1/export", 200)

        return True

    def cleanup(self):
        """Clean up created test data"""
        print("\n" + "="*50)
        print("CLEANING UP TEST DATA")
        print("="*50)

        # Delete students (this will also delete related grades)
        for student_id in self.created_ids['students']:
            self.run_test(f"Delete Student {student_id}", "DELETE", f"students/{student_id}", 200)

        # Delete subjects (this will also delete related data)
        for subject_id in self.created_ids['subjects']:
            self.run_test(f"Delete Subject {subject_id}", "DELETE", f"subjects/{subject_id}", 200)

        # Delete learning objectives
        for obj_id in self.created_ids['learning_objectives']:
            self.run_test(f"Delete Learning Objective {obj_id}", "DELETE", f"learning-objectives/{obj_id}", 200)

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Teacher Grading API Tests")
        print(f"Base URL: {self.base_url}")
        print("="*60)

        try:
            # Test basic connectivity
            if not self.test_root_endpoint():
                print("❌ Root endpoint failed - stopping tests")
                return 1

            # Clean up any existing test data first
            print("\n🧹 Cleaning up any existing test data...")
            self.run_test("Delete All Students", "DELETE", "students", 200)

            # Test all modules
            self.test_student_management()
            self.test_subject_management() 
            self.test_subject_class_objectives()
            self.test_grade_management()
            self.test_reports()
            self.test_excel_operations()

            # Cleanup
            self.cleanup()

        except Exception as e:
            print(f"❌ Test suite failed with error: {str(e)}")
            return 1

        # Print final results
        print("\n" + "="*60)
        print("📊 FINAL TEST RESULTS")
        print("="*60)
        print(f"Tests run: {self.tests_run}")
        print(f"Tests passed: {self.tests_passed}")
        print(f"Tests failed: {self.tests_run - self.tests_passed}")
        print(f"Success rate: {(self.tests_passed/self.tests_run)*100:.1f}%")

        return 0 if self.tests_passed == self.tests_run else 1

def main():
    tester = TeacherGradingAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())