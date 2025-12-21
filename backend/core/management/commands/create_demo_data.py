"""
Management command to create demo data.
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from users.models import Department, Role
from tasks.models import Project, Task, Tag, TaskColumn
from documents.models import DocumentType, ApprovalWorkflow, WorkflowStep

User = get_user_model()


class Command(BaseCommand):
    help = 'Create demo data for the corporate portal'

    def handle(self, *args, **options):
        self.stdout.write('Creating demo data...')

        # Create departments
        it_dept, _ = Department.objects.get_or_create(
            name='IT отдел',
            defaults={'description': 'Отдел информационных технологий'}
        )
        hr_dept, _ = Department.objects.get_or_create(
            name='HR отдел',
            defaults={'description': 'Отдел кадров'}
        )

        # Create roles
        admin_role, _ = Role.objects.get_or_create(
            code='admin',
            defaults={'name': 'Администратор', 'description': 'Полный доступ'}
        )
        manager_role, _ = Role.objects.get_or_create(
            code='manager',
            defaults={'name': 'Менеджер', 'description': 'Управление проектами'}
        )
        employee_role, _ = Role.objects.get_or_create(
            code='employee',
            defaults={'name': 'Сотрудник', 'description': 'Обычный сотрудник'}
        )

        # Create users
        admin_user, _ = User.objects.get_or_create(
            email='admin@example.com',
            defaults={
                'username': 'admin',
                'first_name': 'Администратор',
                'last_name': 'Системы',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if not admin_user.check_password('admin123'):
            admin_user.set_password('admin123')
            admin_user.save()

        manager_user, _ = User.objects.get_or_create(
            email='manager@example.com',
            defaults={
                'username': 'manager',
                'first_name': 'Иван',
                'last_name': 'Менеджеров',
                'department': it_dept,
                'role': manager_role,
            }
        )
        if not manager_user.check_password('manager123'):
            manager_user.set_password('manager123')
            manager_user.save()

        employee_user, _ = User.objects.get_or_create(
            email='employee@example.com',
            defaults={
                'username': 'employee',
                'first_name': 'Петр',
                'last_name': 'Сотрудников',
                'department': it_dept,
                'role': employee_role,
            }
        )
        if not employee_user.check_password('employee123'):
            employee_user.set_password('employee123')
            employee_user.save()

        # Create projects
        project1, _ = Project.objects.get_or_create(
            name='Разработка портала',
            defaults={
                'description': 'Разработка корпоративного портала',
                'manager': manager_user,
                'department': it_dept,
                'status': 'active',
                'color': '#3B82F6',
            }
        )

        # Create tags
        tag1, _ = Tag.objects.get_or_create(name='Важно', defaults={'color': '#EF4444'})
        tag2, _ = Tag.objects.get_or_create(name='Разработка', defaults={'color': '#3B82F6'})

        # Create task columns
        columns = [
            ('К выполнению', 0),
            ('В работе', 1),
            ('На проверке', 2),
            ('Выполнено', 3),
        ]
        for name, position in columns:
            TaskColumn.objects.get_or_create(
                name=name,
                defaults={'position': position, 'is_default': True}
            )

        # Create tasks
        task1, _ = Task.objects.get_or_create(
            title='Настроить аутентификацию',
            defaults={
                'description': 'Настроить JWT аутентификацию в системе',
                'project': project1,
                'assignee': employee_user,
                'reporter': manager_user,
                'priority': 'high',
                'status': 'in_progress',
            }
        )
        task1.tags.add(tag1, tag2)

        task2, _ = Task.objects.get_or_create(
            title='Создать API для задач',
            defaults={
                'description': 'Реализовать REST API для управления задачами',
                'project': project1,
                'assignee': employee_user,
                'reporter': manager_user,
                'priority': 'medium',
                'status': 'todo',
            }
        )
        task2.tags.add(tag2)

        # Create document types
        doc_type1, _ = DocumentType.objects.get_or_create(
            name='Договор',
            defaults={'description': 'Тип документа - договор'}
        )
        doc_type2, _ = DocumentType.objects.get_or_create(
            name='Акт',
            defaults={'description': 'Тип документа - акт'}
        )

        # Create approval workflow
        workflow, _ = ApprovalWorkflow.objects.get_or_create(
            name='Стандартное согласование',
            defaults={
                'description': 'Стандартный маршрут согласования документов',
                'is_active': True,
            }
        )

        # Create workflow steps
        step1, _ = WorkflowStep.objects.get_or_create(
            workflow=workflow,
            order=1,
            defaults={
                'name': 'Согласование руководителем',
                'approver': manager_user,
                'is_required': True,
            }
        )

        self.stdout.write(self.style.SUCCESS('Demo data created successfully!'))
        self.stdout.write(f'Admin user: admin@example.com / admin123')
        self.stdout.write(f'Manager user: manager@example.com / manager123')
        self.stdout.write(f'Employee user: employee@example.com / employee123')

