
Chart export error: 'FileResponse' object has no attribute '_closable_objects'
Traceback (most recent call last):
  File "/home/ahmed/tech-Savvy-projects/2025/real_clients/Expenses-platform/back/expenses/views.py", line 552, in post
    response._closable_objects.append(open(filename, 'rb'))
    ^^^^^^^^^^^^^^^^^^^^^^^^^^
AttributeError: 'FileResponse' object has no attribute '_closable_objects'

Internal Server Error: /api/expenses/export/chart/
[19/Apr/2025 02:18:09] "POST /api/expenses/export/chart/ HTTP/1.1" 500 95




Error generating chart: 'FileResponse' object has no attribute '_closable_objects'
