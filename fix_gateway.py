with open('/opt/AgroflexSOA/docker-compose.yml','r') as f:
    c = f.read()

# Find the gateway environment block and add volumes before it
old = '    environment:\n      <<: *db-env\n\n  # \u2500\u2500 Auth Service'
new = '    volumes:\n      - ./gateway-config/application.yml:/app/config/application.yml\n    environment:\n      <<: *db-env\n\n  # \u2500\u2500 Auth Service'

if old in c:
    c = c.replace(old, new)
    with open('/opt/AgroflexSOA/docker-compose.yml','w') as f:
        f.write(c)
    print('OK - volumen agregado al gateway')
else:
    print('Patron no encontrado, buscando alternativas...')
    idx = c.find('gateway:')
    print(repr(c[idx:idx+500]))
